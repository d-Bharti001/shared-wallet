const ethereum = window.ethereum;
const CONTRACT_ADDR = "0xAE632FFfAd3B185fe95f828D4179F64Bb46768FE";
var web3;
var contract;
var userAddress = "";
var savedWalletBalance = "0";
var savedAllowance = "0";

async function initialize() {
    if (ethereum && ethereum.isMetaMask) {
        let chainId = await ethereum.request({method: "eth_chainId"});
        if (chainId == "0x5") {
            initializeContents();
        }
        else {
            alert("Please switch to Goerli Test network.");
        }
    }

    else {
        alert("Metamask extension missing!\
        \nPlease install Metamask and switch to Goerli test network.");
    }
}

async function initializeContents() {
    await updateUserAddress();
    await updateWeb3();
    await updateContract();
    updateWalletBalance();
    updateYourAllowance();
    updateTargetAccount();

    ethereum.on("accountsChanged", async function(accounts) {
        await updateUserAddress();
        updateYourAllowance();
        updateTargetAccount();
    });

    ethereum.on("chainChanged", function(chainId) {
        window.location.reload();
    });
}

async function updateUserAddress() {
    let addresses = await ethereum.request({method: "eth_requestAccounts"});
    userAddress = addresses[0];
}

async function updateWeb3() {
    web3 = new Web3(ethereum);
}

async function updateContract() {
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDR);
}

async function updateWalletBalance() {
    savedWalletBalance = await web3.eth.getBalance(CONTRACT_ADDR);
    updateWalletBalanceContent();
}

function updateWalletBalanceContent() {
    let unit = document.getElementById("wallet-balance-units").value;
    let value = web3.utils.fromWei(savedWalletBalance, unit);
    document.getElementById("wallet-balance").innerText = value;
}

async function updateYourAllowance() {
    savedAllowance = await contract.methods.allowance(userAddress).call();
    updateYourAllowanceContent();
}

function updateYourAllowanceContent() {
    let unit = document.getElementById("your-allowance-units").value;
    let value = web3.utils.fromWei(savedAllowance, unit);
    document.getElementById("your-allowance").innerText = value;
}

function updateTargetAccount() {
    document.getElementById("target-account").value = userAddress;
}

async function withdrawTransaction() {
    let toAccount = document.getElementById("target-account").value;
    let amount = document.getElementById("withdraw-amount").value;
    let unit = document.getElementById("withdraw-amount-units").value;

    if(/\./.test(amount)) {
        alert("Please enter only integral values. Decimal values aren't supported.");
        return;
    }

    amount = web3.utils.toWei(amount, unit);
    await contract.methods.withdrawMoney(toAccount, amount).send({from: userAddress});

    updateWalletBalance();
    updateYourAllowance();
    document.getElementById("withdraw-amount").value = "0";
}

window.addEventListener("DOMContentLoaded", initialize);
