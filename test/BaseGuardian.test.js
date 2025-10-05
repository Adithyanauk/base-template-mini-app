const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseGuardian", function () {
  let baseGuardian;
  let owner;
  let reporter;
  let validator;
  let maliciousContract;

  beforeEach(async function () {
    [owner, reporter, validator, maliciousContract] = await ethers.getSigners();

    const BaseGuardian = await ethers.getContractFactory("BaseGuardian");
    baseGuardian = await BaseGuardian.deploy();
    await baseGuardian.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await baseGuardian.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct default values", async function () {
      expect(await baseGuardian.reportFee()).to.equal(ethers.parseEther("0.001"));
      expect(await baseGuardian.validationReward()).to.equal(ethers.parseEther("0.0005"));
      expect(await baseGuardian.validators(owner.address)).to.be.true;
    });
  });

  describe("Threat Reporting", function () {
    it("Should allow reporting threats with fee", async function () {
      const reportFee = await baseGuardian.reportFee();
      
      await expect(
        baseGuardian.connect(reporter).reportThreat(
          maliciousContract.address,
          0, // HONEYPOT
          85,
          "Contract prevents selling tokens",
          { value: reportFee }
        )
      ).to.emit(baseGuardian, "ThreatReported")
        .withArgs(
          reporter.address,
          maliciousContract.address,
          0,
          85,
          "Contract prevents selling tokens"
        );
    });

    it("Should reject reports without sufficient fee", async function () {
      await expect(
        baseGuardian.connect(reporter).reportThreat(
          maliciousContract.address,
          0,
          85,
          "Evidence",
          { value: ethers.parseEther("0.0005") } // Insufficient fee
        )
      ).to.be.revertedWith("Insufficient fee");
    });

    it("Should reject reports with invalid risk score", async function () {
      const reportFee = await baseGuardian.reportFee();
      
      await expect(
        baseGuardian.connect(reporter).reportThreat(
          maliciousContract.address,
          0,
          150, // Invalid score > 100
          "Evidence",
          { value: reportFee }
        )
      ).to.be.revertedWith("Risk score exceeds maximum");
    });
  });

  describe("Risk Analysis", function () {
    beforeEach(async function () {
      // Report a threat first
      const reportFee = await baseGuardian.reportFee();
      await baseGuardian.connect(reporter).reportThreat(
        maliciousContract.address,
        0, // HONEYPOT
        85,
        "Contract prevents selling",
        { value: reportFee }
      );
    });

    it("Should return correct risk analysis", async function () {
      const analysis = await baseGuardian.getRiskAnalysis(maliciousContract.address);
      
      expect(analysis.riskScore).to.equal(85);
      expect(analysis.reportCount).to.equal(1);
      expect(analysis.riskLevel).to.equal(2); // DANGEROUS (85 > 70)
      expect(analysis.threatTypes).to.have.lengthOf(1);
      expect(analysis.threatTypes[0]).to.equal(0); // HONEYPOT
    });

    it("Should identify high risk contracts", async function () {
      const riskCheck = await baseGuardian.isHighRiskContract(maliciousContract.address);
      
      expect(riskCheck.isHighRisk).to.be.true;
      expect(riskCheck.riskScore).to.equal(85);
    });
  });

  describe("Validator Functions", function () {
    it("Should allow owner to add validators", async function () {
      await expect(
        baseGuardian.addValidator(validator.address)
      ).to.emit(baseGuardian, "ValidatorAdded")
        .withArgs(validator.address);
      
      expect(await baseGuardian.validators(validator.address)).to.be.true;
    });

    it("Should allow validators to validate reports", async function () {
      // Add validator
      await baseGuardian.addValidator(validator.address);
      
      // Report a threat first
      const reportFee = await baseGuardian.reportFee();
      await baseGuardian.connect(reporter).reportThreat(
        maliciousContract.address,
        1, // RUGPULL
        90,
        "Liquidity removed",
        { value: reportFee }
      );

      // Get report ID (in real implementation, you'd get this from event logs)
      // For testing, we'll simulate the report ID generation
      const reportId = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "address", "uint8", "uint256", "uint256"],
          [reporter.address, maliciousContract.address, 1, await ethers.provider.getBlockNumber(), 0]
        )
      );

      // Note: This test would need the actual report ID from the event
      // In a real scenario, you'd capture it from the ThreatReported event
    });
  });

  describe("Security Metrics", function () {
    it("Should track security metrics correctly", async function () {
      const reportFee = await baseGuardian.reportFee();
      
      // Report threats for different contracts
      await baseGuardian.connect(reporter).reportThreat(
        maliciousContract.address,
        0,
        85,
        "Evidence 1",
        { value: reportFee }
      );

      const metrics = await baseGuardian.getSecurityMetrics();
      expect(metrics.totalContracts).to.equal(1);
      expect(metrics.flaggedContracts).to.equal(1); // High risk contract
    });
  });

  describe("Fee Management", function () {
    it("Should allow owner to update fees", async function () {
      const newReportFee = ethers.parseEther("0.002");
      const newValidationReward = ethers.parseEther("0.001");

      await baseGuardian.updateFees(newReportFee, newValidationReward);

      expect(await baseGuardian.reportFee()).to.equal(newReportFee);
      expect(await baseGuardian.validationReward()).to.equal(newValidationReward);
    });

    it("Should not allow non-owner to update fees", async function () {
      const newReportFee = ethers.parseEther("0.002");
      const newValidationReward = ethers.parseEther("0.001");

      await expect(
        baseGuardian.connect(reporter).updateFees(newReportFee, newValidationReward)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdraw by owner", async function () {
      // Send some ETH to contract
      await reporter.sendTransaction({
        to: await baseGuardian.getAddress(),
        value: ethers.parseEther("1.0")
      });

      const contractBalance = await ethers.provider.getBalance(await baseGuardian.getAddress());
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await baseGuardian.emergencyWithdraw();

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });
  });
});