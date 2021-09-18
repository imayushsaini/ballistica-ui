# -*- coding: utf-8 -*-
# coding: utf-8
from typing import Optional, Any, Dict, List, Type, Sequence
from ba._gameactivity import GameActivity
import ba,_ba
import psutil as p
import json
import os
import _thread
# from stats import mystats
os.environ['FLASK_APP'] = 'bombsquadflaskapi.py'
os.environ['FLASK_ENV'] = 'development'


stats={}

class BsDataThread(object):
    def __init__(self):
        self.Timer = ba.Timer( 8,ba.Call(self.refreshStats),timetype = ba.TimeType.REAL,repeat = True)

    def refreshStats(self):
        
        liveplayers={}
        nextMap=''
        currentMap=''
        global stats
        for i in _ba.get_game_roster():
            
            
            try:
                liveplayers[i['account_id']]={'name':i['players'][0]['name_full'],'client_id':i['client_id'],'device_id':i['display_string']}
            except:
                liveplayers[i['account_id']]={'name':"<in-lobby>",'clientid':i['client_id'],'device_id':i['display_string']}
        try:    
            nextMap=_ba.get_foreground_host_session().get_next_game_description().evaluate()

            current_game_spec=_ba.get_foreground_host_session()._current_game_spec
            gametype: Type[GameActivity] =current_game_spec['resolved_type']
            
            currentMap=gametype.get_settings_display_string(current_game_spec).evaluate()
        except:
            pass
        minigame={'current':currentMap,'next':nextMap}
        system={'cpu':p.cpu_percent(),'ram':p.virtual_memory().percent}
        #system={'cpu':80,'ram':34}
        stats['system']=system
        stats['roster']=liveplayers
        stats['chats']=_ba.get_chat_messages()
        stats['playlist']=minigame
        stats['teamInfo']=self.getTeamInfo()

        #print(self.getTeamInfo());

    def getTeamInfo(self):
        data={}
        
        session=_ba.get_foreground_host_session()
        data['sessionType']=type(session).__name__
        teams=session.sessionteams
        for team in teams:
            data[team.id]={'name':team.name.evaluate(),
                           'color':list(team.color),
                           'score':team.customdata['score'],
                           'players':[]
                            }
            for player in team.players:
                teamplayer={'name':player.getname(),
                            'device_id':player.inputdevice.get_account_name(True),
                            'inGame':player.in_game,
                            'character':player.character,
                            'account_id':player.get_account_id()
                            }
                data[team.id]['players'].append(teamplayer)

        return data


        
BsDataThread()



import flask
from flask import request, jsonify

app = flask.Flask(__name__)
app.config["DEBUG"] = False


@app.route('/', methods=['GET'])
def home():
    return '''Nothing here :)'''


# A route to return all of the available entries in our catalog.
@app.route('/getStats', methods=['GET'])
def api_all():
    return json.dumps(stats)


# ba_meta export plugin
class InitalRun(ba.Plugin):
    def __init__(self):
        flask_run = _thread.start_new_thread(app.run, ("0.0.0.0",5000,False ))


# SAMPLE OUTPUT
# {'system': {'cpu': 80, 'ram': 34}, 'roster': {}, 'chats': [], 'playlist': {'current': 'Meteor Shower @ Rampage', 'next': 'Assault @ Step Right Up'}, 'teamInfo': {'sessionType': 'DualTeamSession', 0: {'name': 'Blue', 'color': (0.1, 0.25, 1.0), 'score': 1, 'players': [{'name': 'Jolly', 'device_id': '\ue030PC295588', 'inGame': True, 'character': 'xmas', 'account_id': 'pb-IF4TVWwZUQ=='}]}, 1: {'name': 'Red', 'color': (1.0, 0.25, 0.2), 'score': 0, 'players': []}}}