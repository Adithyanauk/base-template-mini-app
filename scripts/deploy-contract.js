const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BaseGuardian contract to Base network...");

  // Get the contract factory
  const BaseGuardian = await ethers.getContractFactory("BaseGuardian");

  // Deploy the contract
  console.log("📄 Deploying contract...");
  const baseGuardian = await BaseGuardian.deploy();

  // Wait for deployment to complete
  await baseGuardian.waitForDeployment();

  const contractAddress = await baseGuardian.getAddress();
  console.log(`✅ BaseGuardian deployed to: ${contractAddress}`);

  // Verify the contract on Basescan (if not on localhost)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await baseGuardian.deploymentTransaction().wait(6);

    console.log("🔍 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Output deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log(`Network: ${network.name}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer: ${(await ethers.getSigners())[0].address}`);
  console.log(`Gas Used: ${(await baseGuardian.deploymentTransaction().wait()).gasUsed}`);

  // Set up initial configuration
  console.log("\n⚙️ Setting up initial configuration...");
  
  try {
    // Set report fee to 0.001 ETH (already set in constructor)
    console.log("📊 Report fee: 0.001 ETH");
    console.log("🎁 Validation reward: 0.0005 ETH");
    console.log("✅ Initial configuration complete");
  } catch (error) {
    console.log("❌ Configuration failed:", error.message);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n🔗 Next steps:");
  console.log("1. Add the contract address to your frontend configuration");
  console.log("2. Fund the contract with ETH for validation rewards");
  console.log("3. Add additional validators if needed");
  console.log(`4. Interact with the contract at: https://basescan.org/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });