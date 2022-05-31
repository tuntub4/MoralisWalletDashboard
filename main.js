console.log("hello world");

const serverUrl = "https://cebt9xb29siv.usemoralis.com:2053/server";
const appId = "yDDVWB7nhcBszDbt4hCLiiUoRTc5TGWZYJ1MjV1L";
Moralis.start({ serverUrl, appId });

let homepage = "http://127.0.0.1:5500/index.html";
if (Moralis.User.current() == null && window.location.href != homepage) {
    document.querySelector('body').style.display = 'none';
    window.location.href = "index.html";
}

login = async () => {
    await Moralis.authenticate().then(async function (user) {
        console.log('logged in');
        user.set("name", document.getElementById('user-username').value);
        user.set("email", document.getElementById('user-email').value);
        await user.save()

        window.location.href = "dashboard.html";
    })
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "index.html";
}

getTransactions = async () => {
    const options = {
        chain: "rinkeby",
        address: "0xc2a63C681c3446468Db3f4b7B5D34831b4E424E8",
    };
    const transactions = await Moralis.Web3API.account.getTransactions(options);
    console.log(transactions);

    if (transactions.total > 0) {
        let table = `
        <table class="table">
        <thead>
            <tr>
                <th scope="col">Transaction</th>
                <th scope="col">Block Number</th>
                <th scope="col">Age</th>
                <th scope="col">Type</th>
                <th scope="col">Fee</th>
                <th scope="col">Value</th>
            </tr>
        </thead>
        <tbody id="theTransactions">
        </tbody>
        </table>
        `
        document.querySelector('#tableOfTransactions').innerHTML = table;

        transactions.result.forEach(t => {
            let content = `
            <tr>
                <td><a href='https://rinkeby.etherscan.io/tx/${t.hash}' target="_blank" rel="noopener noreff">${t.hash}</a></td>
                <td><a href='https://rinkeby.etherscan.io/block/${t.block_number}' target="_blank" rel="noopener noreff">${t.block_number}</a></td>
                <td>${millisecondsToTime(Date.parse(new Date()) - Date.parse(t.block_timestamp))}</td>
                <td>${t.from_address == Moralis.User.current().get('ethAddress') ? 'Outgoing' : 'Incoming'}</td>
                <td>${(t.gas * t.gas_price / 1e18).toFixed(5)}</td>
                <td>${(t.value / 1e18).toFixed(5)} ETH</td>
            </tr>
            `
            theTransactions.innerHTML += content;
        });
    }
}

millisecondsToTime = (ms) => {
    let minutes = Math.floor(ms / (1000 * 60));
    let hours = Math.floor(ms / (1000 * 60 * 60));
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days < 1) {
        if (hours < 1) {
            if (minutes < 1) {
                return `less than a minute ago`
            } else return `${minutes} minute(s) ago`
        } else return `${hours} hour(s) ago`
    } else return `${days} day(s) ago`
}

getBalances = async () => {
    console.log('get balances');
    const ethBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "eth" });
    const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "ropsten" });
    const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "rinkeby" });

    let content = document.querySelector('#userBalances').innerHTML = `
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Chain</th>
                <th scope="col">Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>Ether</th>
                <td>${(ethBalance.balance / 1e18).toFixed(5)} ETH</td>
            </tr>
            <tr>
                <th>Ropsten ETH</th>
                <td>${(ropstenBalance.balance / 1e18).toFixed(5)} ETH</td>
            </tr>
            <tr>
                <th>Rinkeby ETH</th>
                <td>${(rinkebyBalance.balance / 1e18).toFixed(5)} ETH</td>
            </tr>
        </tbody>
        </table>
    `
}

getNFTs = async () => {
    console.log("Getting NFTs");
    let nfts = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby' });
    console.log(nfts);
    let tableOfNFTs = document.querySelector('#tableOfNFTs');
    if (nfts.result.length > 0) {
        nfts.result.forEach(n => {
            let metadata = JSON.parse(n.metadata);
            let content = `
            <div class="card" col-md-3>
                <img src="${fixURL(metadata.image_url)}" class="card-img-top" height=300>
                <div class="card-body">
                    <h5 class="card-title">${metadata.name}</h5>
                    <p class="card-text">${metadata.description}</p>
                </div>
            </div>
            `
            tableOfNFTs.innerHTML += content;
        });
    }
}

fixURL = (url) => {
    if(url != null){
        if(url.startsWith("ipfs")) {
            return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)
        } else {
            return url + "?format=json"
        }
    }
}

if (document.querySelector('#btn-login') != null) {
    document.querySelector('#btn-login').onclick = login;
}

if (document.querySelector('#btn-logout') != null) {
    document.querySelector('#btn-logout').onclick = logout;
}

if (document.querySelector('#get-transactions-link') != null) {
    document.querySelector('#get-transactions-link').onclick = getTransactions;
}

if (document.querySelector('#get-balances-link') != null) {
    document.querySelector('#get-balances-link').onclick = getBalances;
}

if (document.querySelector('#get-nfts-link') != null) {
    document.querySelector('#get-nfts-link').onclick = getNFTs;
}

//get-transactions-link
//get-balances-link
//get-nfts-link




