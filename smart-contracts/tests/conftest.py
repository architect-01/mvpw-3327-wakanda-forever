#!/usr/bin/python3

import pytest
from utils import *


@pytest.fixture(scope="function", autouse=True)
def isolate(fn_isolation):
    # perform a chain rewind after completing each test, to ensure proper isolation
    # https://eth-brownie.readthedocs.io/en/v1.10.3/tests-pytest-intro.html#isolation-fixtures
    pass

@pytest.fixture(scope="module")
def token(Token, accounts):
    king = getKing(accounts)
    contract_cfg = getConfig()['token']
    return Token.deploy(contract_cfg['name'], contract_cfg['symbol'], contract_cfg['decimals'], contract_cfg['total_supply'], {'from': king})

@pytest.fixture(scope="module")
def voting(Token, Voting, accounts):
    king = getKing(accounts)
    candidateNames, candidateAges, candidateCults = unpackCandidates()
    contractName = getConfig()['voting']['name']
    return Voting.deploy("UN.Elections", Token[-1].address, candidateNames, candidateAges, candidateCults, {'from':king})

