#!/usr/bin/python3
'''
    Deploys all contracts on the network of choice, saves their addresses to the DeployedContracts.json file and copies 
    the build/contracts dir to the provided path - to be used by the website.
'''

from brownie import Token, Voting, accounts
import json, os, shutil



#CONFIGURATION
OUTPUT_CONTRACT_ADRESSES_FILENAME = '../website/DeployedContracts/DeployedContracts.json'
OUTPUT_BUILD_CONTRACTS_COPY_PATH = '../website/DeployedContracts/build'

def getConfig():
    return json.load(open('..\\CONFIG.json', 'r'))

def unpackCandidates():
    candidates = getConfig()['voting']['candidates']
    candidateNames = [cand['name'] for cand in candidates]
    candidateAges = [cand['age'] for cand in candidates]
    candidateCults = [cand['cult'] for cand in candidates]
    return candidateNames, candidateAges, candidateCults

def main():

    king = accounts.load('king')

    token_cfg = getConfig()['token']
    voting_cfg = getConfig()['voting']

    candidateNames, candidateAges, candidateCults = unpackCandidates()

    #deploy the contracts
    token = Token.deploy(token_cfg['name'], token_cfg['symbol'], token_cfg['decimals'], token_cfg['total_supply'], {'from': king})
    voting = Voting.deploy(voting_cfg['name'], token.address, candidateNames, candidateAges, candidateCults, {'from': king})

    #set the authority on WKND token
    tx = token.setAuthorityAddress(voting.address, {'from': king})
    tx.wait(1)

    #save the deployed contract addresses and ABIs to be used by the webite
    addresses = {'WKND_Token_Address': token.address, "Voting_Address": voting.address}
    with open(OUTPUT_CONTRACT_ADRESSES_FILENAME, 'w') as outfile:
        json.dump(addresses, outfile)
    try:
        shutil.rmtree(OUTPUT_BUILD_CONTRACTS_COPY_PATH)
    except:
        pass
    shutil.copytree('./build', OUTPUT_BUILD_CONTRACTS_COPY_PATH) 



    return token, voting