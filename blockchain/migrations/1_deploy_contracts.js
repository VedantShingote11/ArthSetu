/**
 * Migration Script for MicrofinanceLoan Contract
 * 
 * This script deploys the MicrofinanceLoan smart contract to the blockchain
 * and saves the contract address and ABI for backend integration.
 */

const MicrofinanceLoan = artifacts.require("MicrofinanceLoan");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer, network, accounts) {
    console.log("\n=================================");
    console.log("Deploying MicrofinanceLoan Contract");
    console.log("=================================\n");

    console.log("Network:", network);
    console.log("Deployer account:", accounts[0]);

    // Deploy the contract
    await deployer.deploy(MicrofinanceLoan);
    const instance = await MicrofinanceLoan.deployed();

    console.log("\n✅ MicrofinanceLoan deployed successfully!");
    console.log("Contract Address:", instance.address);

    // Save contract address and ABI for backend integration
    const contractData = {
        address: instance.address,
        network: network,
        deployedAt: new Date().toISOString(),
        abi: MicrofinanceLoan.abi
    };

    // Create deployment info directory if it doesn't exist
    const deploymentDir = path.join(__dirname, '../deployment');
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }

    // Save contract data to JSON file
    const contractDataPath = path.join(deploymentDir, 'contract-data.json');
    fs.writeFileSync(
        contractDataPath,
        JSON.stringify(contractData, null, 2)
    );

    console.log("\n📄 Contract data saved to:", contractDataPath);

    // Also save just the ABI separately for easy access
    const abiPath = path.join(deploymentDir, 'MicrofinanceLoan-abi.json');
    fs.writeFileSync(
        abiPath,
        JSON.stringify(MicrofinanceLoan.abi, null, 2)
    );

    console.log("📄 ABI saved to:", abiPath);

    // Display demo account information
    console.log("\n=================================");
    console.log("Demo Accounts (Ganache)");
    console.log("=================================");
    console.log("\nUse these accounts for testing:");
    console.log("\n🔹 Borrower Account (Account 1):");
    console.log("   Address:", accounts[1]);
    console.log("\n🔹 Lender Account (Account 2):");
    console.log("   Address:", accounts[2]);
    console.log("\n🔹 Additional Lender (Account 3):");
    console.log("   Address:", accounts[3]);

    console.log("\n=================================");
    console.log("Next Steps:");
    console.log("=================================");
    console.log("1. Copy the contract address to your backend .env file");
    console.log("2. Update CONTRACT_ADDRESS in backend/.env");
    console.log("3. Start your Node.js backend server");
    console.log("4. Test the integration with the Flutter app");
    console.log("\n✨ Deployment complete!\n");
};
