import brownie
import random
import pytest
from brownie import exceptions
from utils import *
from collections import Counter


def test_balance_before_registering(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #check if their balance is equal to 0
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
        assert token.balanceOf(voter) == getRegistrationAmount()


def test_second_registration_without_transfer(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #register all of the voters
    for voter in voters:
        tx = voting.register(voter.address, {'from': server})
        tx.wait(1)

    with pytest.raises(exceptions.VirtualMachineError):
        tx = voting.register(voters[0].address, {'from': voters[0]})
        tx.wait(1)

def test_second_registration_after_transfer(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(voting.address, {'from': king})

    #register all of the voters
    for voter in voters:
        tx = voting.register(voter.address, {'from': server})
        tx.wait(1)

    token.transfer(voters[1], getRegistrationAmount(), {'from': voters[0]})
    with pytest.raises(exceptions.VirtualMachineError):
        tx = voting.register(voters[0].address, {'from': voters[0]})
        tx.wait(1)



