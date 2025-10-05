// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title BaseGuardian
 * @dev On-chain security analysis and reputation system for Base network transactions
 * @notice This contract provides decentralized security scoring and threat reporting
 */
contract BaseGuardian is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event ThreatReported(
        address indexed reporter,
        address indexed targetContract,
        ThreatType threatType,
        uint256 riskScore,
        string evidence
    );
    
    event ReputationUpdated(
        address indexed contractAddress,
        uint256 newScore,
        uint256 reportCount
    );
    
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    // Enums
    enum ThreatType {
        HONEYPOT,
        RUGPULL,
        MEV_VULNERABILITY,
        SANDWICH_RISK,
        PHISHING,
        MALICIOUS_CONTRACT
    }

    enum RiskLevel {
        SAFE,      // 0-30
        RISKY,     // 31-70
        DANGEROUS  // 71-100
    }

    // Structs
    struct ThreatReport {
        address reporter;
        ThreatType threatType;
        uint256 riskScore;
        string evidence;
        uint256 timestamp;
        bool validated;
        uint256 validationCount;
    }

    struct ContractReputation {
        uint256 totalScore;
        uint256 reportCount;
        uint256 validationScore;
        bool isVerified;
        uint256 lastUpdated;
        mapping(ThreatType => uint256) threatCounts;
    }

    struct SecurityMetrics {
        uint256 totalContracts;
        uint256 flaggedContracts;
        uint256 validatedReports;
        uint256 falsePositives;
    }

    // State variables
    mapping(address => ContractReputation) public contractReputations;
    mapping(bytes32 => ThreatReport) public threatReports;
    mapping(address => bool) public validators;
    mapping(address => uint256) public reporterScores;
    
    SecurityMetrics public metrics;
    
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant MIN_VALIDATOR_SCORE = 75;
    uint256 public reportIdCounter;
    
    // Fees
    uint256 public reportFee = 0.001 ether;
    uint256 public validationReward = 0.0005 ether;

    constructor() {
        validators[msg.sender] = true;
        reporterScores[msg.sender] = 100;
    }

    // Modifiers
    modifier onlyValidator() {
        require(validators[msg.sender], "Not authorized validator");
        _;
    }

    modifier validRiskScore(uint256 _riskScore) {
        require(_riskScore <= MAX_RISK_SCORE, "Risk score exceeds maximum");
        _;
    }

    // Main Functions

    /**
     * @dev Report a potential threat for a contract
     * @param _targetContract Address of the contract being reported
     * @param _threatType Type of threat detected
     * @param _riskScore Risk score (0-100)
     * @param _evidence IPFS hash or description of evidence
     */
    function reportThreat(
        address _targetContract,
        ThreatType _threatType,
        uint256 _riskScore,
        string calldata _evidence
    ) external payable validRiskScore(_riskScore) nonReentrant {
        require(msg.value >= reportFee, "Insufficient fee");
        require(_targetContract != address(0), "Invalid contract address");
        require(bytes(_evidence).length > 0, "Evidence required");

        bytes32 reportId = keccak256(
            abi.encodePacked(
                msg.sender,
                _targetContract,
                _threatType,
                block.timestamp,
                reportIdCounter++
            )
        );

        threatReports[reportId] = ThreatReport({
            reporter: msg.sender,
            threatType: _threatType,
            riskScore: _riskScore,
            evidence: _evidence,
            timestamp: block.timestamp,
            validated: false,
            validationCount: 0
        });

        // Update contract reputation
        _updateContractReputation(_targetContract, _threatType, _riskScore);
        
        // Update reporter score
        _updateReporterScore(msg.sender, true);

        emit ThreatReported(
            msg.sender,
            _targetContract,
            _threatType,
            _riskScore,
            _evidence
        );
    }

    /**
     * @dev Validate a threat report (validator only)
     * @param _reportId ID of the report to validate
     * @param _isValid Whether the report is valid
     */
    function validateReport(
        bytes32 _reportId,
        bool _isValid
    ) external onlyValidator nonReentrant {
        ThreatReport storage report = threatReports[_reportId];
        require(report.reporter != address(0), "Report does not exist");
        require(!report.validated, "Report already validated");

        report.validated = true;
        report.validationCount++;

        if (_isValid) {
            metrics.validatedReports++;
            // Reward the reporter
            _updateReporterScore(report.reporter, true);
        } else {
            metrics.falsePositives++;
            // Penalize the reporter
            _updateReporterScore(report.reporter, false);
        }

        // Send validation reward to validator
        if (address(this).balance >= validationReward) {
            payable(msg.sender).transfer(validationReward);
        }
    }

    /**
     * @dev Get comprehensive risk analysis for a contract
     * @param _contractAddress Address to analyze
     * @return riskLevel Overall risk level
     * @return riskScore Calculated risk score (0-100)
     * @return reportCount Number of reports
     * @return threatTypes Array of detected threat types
     */
    function getRiskAnalysis(address _contractAddress)
        external
        view
        returns (
            RiskLevel riskLevel,
            uint256 riskScore,
            uint256 reportCount,
            ThreatType[] memory threatTypes
        )
    {
        ContractReputation storage reputation = contractReputations[_contractAddress];
        
        reportCount = reputation.reportCount;
        riskScore = reportCount > 0 ? reputation.totalScore / reportCount : 0;
        
        // Determine risk level
        if (riskScore <= 30) {
            riskLevel = RiskLevel.SAFE;
        } else if (riskScore <= 70) {
            riskLevel = RiskLevel.RISKY;
        } else {
            riskLevel = RiskLevel.DANGEROUS;
        }

        // Get threat types with reports
        threatTypes = _getReportedThreats(_contractAddress);
    }

    /**
     * @dev Get security metrics for the entire system
     */
    function getSecurityMetrics()
        external
        view
        returns (SecurityMetrics memory)
    {
        return metrics;
    }

    /**
     * @dev Check if a contract is flagged as high risk
     * @param _contractAddress Address to check
     * @return isHighRisk Whether contract is high risk
     * @return riskScore Current risk score
     */
    function isHighRiskContract(address _contractAddress)
        external
        view
        returns (bool isHighRisk, uint256 riskScore)
    {
        ContractReputation storage reputation = contractReputations[_contractAddress];
        riskScore = reputation.reportCount > 0 ? reputation.totalScore / reputation.reportCount : 0;
        isHighRisk = riskScore > 70;
    }

    // Admin Functions

    /**
     * @dev Add a new validator
     * @param _validator Address of the new validator
     */
    function addValidator(address _validator) external onlyOwner {
        require(_validator != address(0), "Invalid validator address");
        require(!validators[_validator], "Already a validator");
        
        validators[_validator] = true;
        reporterScores[_validator] = 100; // Start with perfect score
        
        emit ValidatorAdded(_validator);
    }

    /**
     * @dev Remove a validator
     * @param _validator Address of the validator to remove
     */
    function removeValidator(address _validator) external onlyOwner {
        require(validators[_validator], "Not a validator");
        
        validators[_validator] = false;
        
        emit ValidatorRemoved(_validator);
    }

    /**
     * @dev Update fee structure
     * @param _reportFee New report fee
     * @param _validationReward New validation reward
     */
    function updateFees(
        uint256 _reportFee,
        uint256 _validationReward
    ) external onlyOwner {
        reportFee = _reportFee;
        validationReward = _validationReward;
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Internal Functions

    function _updateContractReputation(
        address _contractAddress,
        ThreatType _threatType,
        uint256 _riskScore
    ) internal {
        ContractReputation storage reputation = contractReputations[_contractAddress];
        
        if (reputation.reportCount == 0) {
            metrics.totalContracts++;
        }
        
        reputation.totalScore += _riskScore;
        reputation.reportCount++;
        reputation.threatCounts[_threatType]++;
        reputation.lastUpdated = block.timestamp;
        
        // Flag as high risk if score is above threshold
        uint256 avgScore = reputation.totalScore / reputation.reportCount;
        if (avgScore > 70 && !_isAlreadyFlagged(_contractAddress)) {
            metrics.flaggedContracts++;
        }

        emit ReputationUpdated(_contractAddress, avgScore, reputation.reportCount);
    }

    function _updateReporterScore(address _reporter, bool _positive) internal {
        if (_positive) {
            if (reporterScores[_reporter] < 100) {
                reporterScores[_reporter] += 1;
            }
        } else {
            if (reporterScores[_reporter] > 0) {
                reporterScores[_reporter] -= 5; // Larger penalty for false reports
            }
        }
    }

    function _isAlreadyFlagged(address _contractAddress) internal view returns (bool) {
        ContractReputation storage reputation = contractReputations[_contractAddress];
        return (reputation.totalScore / reputation.reportCount) > 70;
    }

    function _getReportedThreats(address _contractAddress)
        internal
        view
        returns (ThreatType[] memory)
    {
        ContractReputation storage reputation = contractReputations[_contractAddress];
        
        // Count non-zero threat types
        uint256 count = 0;
        for (uint256 i = 0; i < 6; i++) {
            if (reputation.threatCounts[ThreatType(i)] > 0) {
                count++;
            }
        }
        
        // Build array of reported threats
        ThreatType[] memory threats = new ThreatType[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < 6; i++) {
            if (reputation.threatCounts[ThreatType(i)] > 0) {
                threats[index] = ThreatType(i);
                index++;
            }
        }
        
        return threats;
    }

    // Receive function to accept ETH
    receive() external payable {}
}