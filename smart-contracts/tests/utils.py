import brownie, json

def getRegistrationAmount():
    return getConfig()['constants']['REGISTRATION_AMOUNT']

def getKing(accounts):
    return accounts[0]

def getServer(accounts):
    return accounts[1]

def getVoters(accounts):
    return accounts[2:]

def getConfig():
    return json.load(open('..\\CONFIG.json', 'r'))

def unpackCandidates():
    candidates = getConfig()['voting']['candidates']
    candidateNames = [cand['name'] for cand in candidates]
    candidateAges = [cand['age'] for cand in candidates]
    candidateCults = [cand['cult'] for cand in candidates]
    return candidateNames, candidateAges, candidateCults