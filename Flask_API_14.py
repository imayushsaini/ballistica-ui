# -*- coding: utf-8 -*-
# coding: utf-8

from flask import request, jsonify
import flask
import json
import os
import thread

import psutil as p

import bs
import bsInternal


# from stats import mystats
os.environ["FLASK_APP"] = "bombsquadflaskapi.py"
os.environ["FLASK_ENV"] = "development"


stats = {}


class BsDataThread(object):
    def __init__(self):
        self.Timer = bs.Timer(
            8, bs.Call(self.refreshStats), repeat=True, timeType="real"
        )

    def refreshStats(self):

        liveplayers = {}
        nextMap = ""
        currentMap = ""
        global stats

        for i in bsInternal._getGameRoster():
            try:
                liveplayers[i["account_id"]] = {
                    "name": i["players"][0]["nameFull"],
                    "client_id": i["clientID"],
                    "device_id": i["displayString"],
                }
            except:
                liveplayers[i["account_id"]] = {
                    "name": "<in-lobby>",
                    "clientid": i["clientID"],
                    "device_id": i["displayString"],
                }

        try:

            nextMap = (
                bsInternal._getForegroundHostSession()
                .getNextGameDescription()
                .evaluate()
            )

            current_game_spec = bsInternal._getForegroundHostActivity()._currentGameSpec
            gametype = current_game_spec["resolveType"]

            currentMap = gametype.getDisplayString(current_game_spec).evaluate()

        except:
            pass

        minigame = {"current": currentMap, "next": nextMap}
        system = {"cpu": p.cpu_percent(), "ram": p.virtual_memory().percent}
        # system={'cpu':80,'ram':34}
        stats["system"] = system
        stats["roster"] = liveplayers
        stats["chats"] = bsInternal._getChatMessages()
        stats["playlist"] = minigame
        stats["teamInfo"] = self.getTeamInfo()

        # print(self.getTeamInfo());

    def getTeamInfo(self):
        data = {}

        session = bsInternal._getForegroundHostSession()
        data["sessionType"] = type(session).__name__
        teams = session.teams
        for team in teams:
            data[team.id] = {
                "name": team.name.evaluate(),
                "color": list(team.color),
                "score": team.sessionData["score"],
                "players": [],
            }
            for player in team.players:
                teamplayer = {
                    "name": player.getName(),
                    "device_id": player.getInputDevice().getAccountName(True),
                    "inGame": player.inGame,
                    "character": player.character,
                    "account_id": player.get_account_id(),
                }
                data[team.id]["players"].append(teamplayer)

        return data


BsDataThread()


app = flask.Flask(__name__)
app.config["DEBUG"] = False


@app.route("/", methods=["GET"])
def home():
    return """Nothing here :)"""


# A route to return all of the available entries in our catalog.
@app.route("/getStats", methods=["GET"])
def api_all():
    return json.dumps(stats)


flask_run = thread.start_new_thread(app.run, ("0.0.0.0", 5000, False))


# SAMPLE OUTPUT
# {'system': {'cpu': 80, 'ram': 34}, 'roster': {}, 'chats': [], 'playlist': {'current': 'Meteor Shower @ Rampage', 'next': 'Assault @ Step Right Up'}, 'teamInfo': {'sessionType': 'DualTeamSession', 0: {'name': 'Blue', 'color': (0.1, 0.25, 1.0), 'score': 1, 'players': [{'name': 'Jolly', 'device_id': '\ue030PC295588', 'inGame': True, 'character': 'xmas', 'account_id': 'pb-IF4TVWwZUQ=='}]}, 1: {'name': 'Red', 'color': (1.0, 0.25, 0.2), 'score': 0, 'players': []}}}
