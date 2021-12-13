import brownie
import random
import pytest
from brownie import exceptions
from utils import *
from collections import Counter



def test_setting_authority_second_time(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(server, {'from': king})

    with pytest.raises(exceptions.VirtualMachineError):
        token.setAuthorityAddress(voters[0], {'from': king})


def test_authority_registration_right(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(server, {'from': king})

    token.usingRegistrationRight(voters[0], getRegistrationAmount(), {'from': server})

    assert token.balanceOf(voters[0]) == getRegistrationAmount()


def test_non_authority_registration_right(accounts, token, voting):

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.setAuthorityAddress(server, {'from': king})

    with pytest.raises(exceptions.VirtualMachineError):
        token.usingRegistrationRight(voters[0], getRegistrationAmount(), {'from': voters[-1]})


def test_authority_voting_right(accounts, token, voting):

    test_authority_registration_right(accounts, token, voting)

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    token.usingVotingRight(voters[0], getRegistrationAmount(), {'from': server})

    assert token.balanceOf(voters[0]) == 0


def test_non_authority_voting_right(accounts, token, voting):

    test_authority_registration_right(accounts, token, voting)

    king, server, voters = getKing(accounts), getServer(accounts), getVoters(accounts)

    with pytest.raises(exceptions.VirtualMachineError):
        token.usingVotingRight(voters[0], getRegistrationAmount(), {'from': voters[-1]})
