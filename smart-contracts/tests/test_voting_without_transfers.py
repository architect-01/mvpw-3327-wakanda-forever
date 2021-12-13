import brownie
import random
import pytest
from brownie import exceptions
from utils import *
from collections import Counter

random.seed(1)

def test_balance_before_registering(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #check if their balance is equal to the 0
    for voter in voters:
        assert token.balanceOf(voter) == 0

def test_balance_after_registering(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #register all of the voters
    for voter in voters:
        tx = voting.register(voter.address, {'from': server})
        tx.wait(1)
    #check if their balance is equal to the REGISTRATION_AMOUNT
    for voter in voters:
        assert token.balanceOf(voter) == getConfig()['constants']['REGISTRATION_AMOUNT']

def test_balance_after_voting(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #register all of the voters
    for voter in voters:
        tx = voting.register(voter.address, {'from': server})
        tx.wait(1)
    #check if their balance is equal to the REGISTRATION_AMOUNT
    for voter in voters:
        tx = voting.vote(0,  getConfig()['constants']['REGISTRATION_AMOUNT'], {'from': voter})
        tx.wait(1)
        assert token.balanceOf(voter) == 0

def test_try_second_registration(accounts, token, voting):

    test_balance_after_registering(accounts, token, voting) #first registration

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    #register all of the voters second time
    for voter in voters:
        with pytest.raises(exceptions.VirtualMachineError):
            tx = voting.register(voter.address, {'from': server})
            tx.wait(1)


def test_try_second_voting(accounts, token, voting):

    test_balance_after_voting(accounts, token, voting) #first voting

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    #try second voting
    for voter in voters:
        with pytest.raises(exceptions.VirtualMachineError):
            tx = voting.vote(0,  getConfig()['constants']['REGISTRATION_AMOUNT'], {'from': voter})
            tx.wait(1)


def test_winning_candidates(accounts, token, voting):

    random.seed(1)

    test_balance_after_registering(accounts, token, voting)

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)
    
    N_CANDIDATES = 9
    #cast votes in favor of a random candidate
    votes = []
    for voter in voters:
        candidateId = random.randint(0, N_CANDIDATES)
        votes.append(candidateId)
        tx = voting.vote(candidateId,  getConfig()['constants']['REGISTRATION_AMOUNT'], {'from': voter})
        tx.wait(1)
    
    actual = voting.winningCandidates()
    expected = sorted(voting.seeAllCandidates(), key=lambda x: x[-1])
    expected.reverse()
    expected = expected[:len(actual)]

    def stringRepr(x):
        return '..'.join([str(a) for a in x])

    actual = [stringRepr(x) for x in actual]
    expected = [stringRepr(x) for x in expected]

    print(actual)
    print(expected)

    for act in actual:
        assert act in expected