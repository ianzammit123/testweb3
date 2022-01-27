import React, {useState,Component, useEffect } from 'react'
import {ethers} from 'ethers'
import "tabler-react/dist/Tabler.css";
import { Card, Button, Grid, List, Badge, StoreCard  } from "tabler-react";
import Dragonnft_abi from './contract/dragonnft_abi.json'


const Dragonnft = () => {

	const contractAddress = '0xaf944425543Cf416210a33E939F5A545A5662D64';
	const draggCoin = '0x7485cc511640a7c963ee1422fd0cbe6767ecdbea';


	const [errorMessage, setErrorMessage] = useState(null);
	const [errorMessager, setErrorMessageRare] = useState(null);
	const [errorMessagesr, setErrorMessageSRare] = useState(null);


	const [defaultAccount, setDefaultAccount] = useState(null);
	const [connButtonText, setConnButtonText] = useState('Connect Wallet');

	const [currentContractVal, setCurrentContractVal] = useState(null);

	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);

	const [myTotalNFTsStandard, setUsersNftCountStandard] = useState(0);
	const [myTotalNFTsRare, setUsersNftCountRare] = useState(0);
	const [myTotalNFTsSuperrare, setUsersNftCountSuperrare] = useState(0);
	const [nftContainer, setNftContainer] = useState(null);


	const connectWalletHandler = () => {
		if (window.ethereum && window.ethereum.isMetaMask) {

			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
				accountChangedHandler(result[0]);
				setConnButtonText(result[0]);
			})
			.catch(error => {
				setErrorMessage(error.message);
			
			});

		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}

	// update account, will cause component re-render
	const accountChangedHandler = async (newAccount) => {
		await setDefaultAccount(newAccount);
		await updateEthers();
	}

	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}


	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);

	const updateEthers = () => {

		const provider = new ethers.providers.Web3Provider(window.ethereum);

		const signer = provider.getSigner();
		setSigner(signer);

		let tempContract = new ethers.Contract(contractAddress, Dragonnft_abi, signer);
		setContract(tempContract);	

	}


	const getUsersNftTotalS = async () => {
		const owned_standard = await contract.ownedNFTS(defaultAccount,"standard");
		setUsersNftCountStandard(parseInt(owned_standard));

		const owned_rare = await contract.ownedNFTS(defaultAccount,"rare");
		setUsersNftCountRare(parseInt(owned_rare));

		const owned_superrares = await contract.ownedNFTS(defaultAccount,"superrare");
		setUsersNftCountSuperrare(parseInt(owned_superrares));
	}

	
	const purchaseStandard = async () => {
		const transaction = await contract.claimCollectible({value: ethers.utils.parseEther("0.01")}).then((result) => {
		}, (error) => {
			setErrorMessage(error.error.message.replace("execution reverted:", ""));
		});
	
		checkPurchaseEvent();
	}

	const purchaseRare = async () => {
	
		const transaction = await contract.claimRareCollectible("rare", {value: ethers.utils.parseEther("0.03")}).then((result) => {
			}, (error) => {
				setErrorMessageRare(error.error.message.replace("execution reverted:", ""));
			});
			checkPurchaseEvent();
	}

	const purchaseSuperRare = async () => {
		const transaction = await contract.claimRareCollectible("superrare", {value: ethers.utils.parseEther("0.05")}).then((result) => {
		}, (error) => {
			setErrorMessageSRare(error.error.message.replace("execution reverted:", ""));
		});
		checkPurchaseEvent();
	}

	const checkPurchaseEvent = async () => {
		contract.on("transferNFT", (nftType, token_id) => {
			console.log("Purchase Successful!");
			console.log(nftType.toString(), parseInt(token_id));
		});
	}

	const getUserTokenIDs = async () => {

		const tokens = await contract.getUserTokenIds();
		const ipfs = "https://ipfs.io/ipfs/";

		// Split the string on underscores
		const user_tokens = tokens.split("_");
		let nft_html = "";
	
		// Loop the user tokens, make sure we are only chekcing ints not blank spaces
		if(user_tokens.length > 0)
		{
			let token_id = "";
			let response = "";

			for (var i=0; i < user_tokens.length; i++) {
				token_id = user_tokens[i];
				if(token_id != ""){
					// We then need to call the tokenURI method to get the IPFS metadata hash
					let tokenURI = await contract.tokenURI(token_id);
					response = await getGitHubUserWithFetch(ipfs+tokenURI);

					let name = response.name;
					let dragonImg = response.image
					let strength = response.attributes[2].value
					let rarity = response.attributes[3].value

					nft_html = nft_html + "<div class='nft_container'>";
						nft_html = nft_html + "<div class='nft_title'>" + name + "</div>";
						nft_html = nft_html + "<div class='nft_img' ><img src="+dragonImg+" /></div>";
						nft_html = nft_html + "<div class='nft_atts'> Strength: " + strength + "</div>";
						nft_html = nft_html + "<div>Rarity: " + rarity +"</div>";
						nft_html = nft_html + "<div><a class='btn btn-primary' href='https://testnets.opensea.io/assets/"+contractAddress+"/"+token_id+"' target='_blank'>View Item!</a></div>";
					nft_html = nft_html + "</div>";
				}
				setNftContainer(nft_html);
			}
	
		}
		
	}


	const getGitHubUserWithFetch = async (ipfsurl) => {
	  const response = await fetch(ipfsurl);
	  const jsonData = await response.json();
	  return jsonData;
	};

	return (

		 <Card>
	       <Card.Header>
	          <Card.Title><b>Dragon NFT!</b></Card.Title>
	          <Card.Options>
	          	 <Button color="primary" onClick={connectWalletHandler}>{connButtonText}</Button>
	          </Card.Options>
	        </Card.Header>

		     <Card.Body>
		     	<h4>Welcome to DragonNFT!</h4>
		     	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam et magna turpis. Quisque quis odio cursus, eleifend dui nec, posuere elit. Sed posuere quis leo et rutrum. Nunc viverra, nulla vel ultrices eleifend, felis eros tempor metus,
		     	in lobortis ante purus eget felis. Curabitur id lacus orci. Morbi accumsan metus eget odio vulputate porta. Vivamus interdum convallis accumsan.<br /><br /> You must purchase 4 standard NFT's to unlock rare and super rare NFTs. </p>

		     	<br />
		     	<h4>Add DragonCoin to metamask!</h4>
		     	<p>For each NFT you purchase you will be sent <b>DRAGG</b> coins, please add the contract address to metamask <b>{draggCoin}</b> to view your DRAGG balance</p>


		     	<Button color="primary" onClick={getUsersNftTotalS}>Update Totals</Button>
		     	<List.Group>
				  <List.GroupItem action active>
				    Your Profile
				  </List.GroupItem>
				  <List.GroupItem action>
				  	My Standard NFTs  <Badge color="primary" className="mr-1">{myTotalNFTsStandard}</Badge>
				  </List.GroupItem>

				  <List.GroupItem action>
				  My Rare NFTS  <Badge color="primary" className="mr-1">{myTotalNFTsRare}</Badge>
				  </List.GroupItem>

				  <List.GroupItem action>
				  	My Super Rare NFTS  <Badge color="primary" className="mr-1">{myTotalNFTsRare}</Badge>
				  </List.GroupItem>
				</List.Group>


				<br />
				<Button color="primary" onClick={getUserTokenIDs}>Load Assets</Button> <br />
				<List.Group>
				  <List.GroupItem action active>
				    Your NFTs
				  </List.GroupItem>
				  <List.GroupItem action>
				  	<div  dangerouslySetInnerHTML={{ __html: nftContainer }}></div>
				  </List.GroupItem>
				</List.Group>

				<br />
				<Grid.Row>
				  <Grid.Col>
				  	<Button color="primary" onClick={purchaseStandard}>Purchase Standard NFT</Button> 
				  	{errorMessage}
				  </Grid.Col>

				  <Grid.Col>
				  		<Button color="primary" onClick={purchaseRare}>Purchase Rare NFT</Button>
				  		{errorMessager}
				  </Grid.Col>

				  <Grid.Col>
				  		<Button color="primary" onClick={purchaseSuperRare}>Purchase Super Rare NFT</Button>
				  		{errorMessagesr}
				  </Grid.Col>


				</Grid.Row>
		
		  </Card.Body>
    	</Card>
	);
}

export default Dragonnft