import brownie
import random
import pytest
from brownie import exceptions
from utils import *
from collections import Counter

def test_balance_after_one_transfer(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #register all of the voters
    for voter in voters:
        tx = voting.register(voter.address, {'from': server})
        tx.wait(1)

    token.transfer(voters[1], getRegistrationAmount(), {'from': voters[0]})

    assert token.balanceOf(voters[0]) == 0
    assert token.balanceOf(voters[1]) == 2 * getRegistrationAmount()

def test_voting_after_one_transfer(accounts, token, voting):

    test_balance_after_one_transfer(accounts, token, voting)

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    tx = voting.vote(0, 2* getRegistrationAmount(), {'from': voters[1]})
    tx.wait(1)

    assert token.balanceOf(voters[1]) == 0
    candidates = voting.seeAllCandidates({'from': king})
    assert candidates[0][-1] == 2*getRegistrationAmount()



def test_voting_after_two_transfers(accounts, token, voting):

    test_balance_after_one_transfer(accounts, token, voting)

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.transfer(voters[2], 2*getRegistrationAmount(), {'from': voters[1]})

    tx = voting.vote(0, 3* getRegistrationAmount(), {'from': voters[2]})
    tx.wait(1)

    assert token.balanceOf(voters[2]) == 0
    candidates = voting.seeAllCandidates({'from': king})
    assert candidates[0][-1] == 3*getRegistrationAmount()