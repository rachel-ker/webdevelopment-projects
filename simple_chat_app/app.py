'''
References
- Completed with help from Trevor and Chi
'''

from flask import Flask, render_template, request, make_response
from functools import wraps
import uuid
import datetime
import string
import secrets

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


chats = {}
# chats dictionary stores everything
# key: chat_id
# - messages [(user, msg)]
# - magic
# - session_token --> user, expiry


@app.route('/')
@app.route('/chat/<int:chat_id>')
def index(chat_id=None):
    return app.send_static_file('index.html')

# -------------------------------- API ROUTES ----------------------------------

def generate_store_token(chat_id, username):
    '''
    Generate and store tokens
    '''
    token = uuid.uuid4().hex
    chats[chat_id]['session_token'][token] =  { "expiry": datetime.datetime.now() + datetime.timedelta(hours=6),
                                                "username": username
                                               }
    return token


@app.route('/api/create', methods=['POST'])
def create():
    username = request.form['username']
    chat_id = int(datetime.datetime.now().strftime('%d%H%M%S%f'))

    # generate magic key
    alphabet = string.ascii_letters + string.digits
    magic_key = ''.join(secrets.choice(alphabet) for i in range(8))

    # store chat
    chats[chat_id] = {
        "messages": [],
        "magic": magic_key,
        "session_token": {}
    }

    token = generate_store_token(chat_id, username)

    return {
        "chat_id": chat_id,
        "session_token": token,
        "magic_invite_link": "http://localhost:5000/chat/{}?magic_key={}".format(chat_id, magic_key)
    }


@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    chat_id = int(request.form['chat_id'])
    username = request.form['username']
    magic_key = request.form['magic_key']

    if request.form['session_token']:
        # if token check if valid
        client_token = request.form['session_token']
        if client_token in chats[chat_id]['session_token'] and \
        chats[chat_id]['session_token'][client_token]['expiry'] > datetime.datetime.now():
            return make_response('Existing Token still valid', 307)

    # check if correct magic_key for that chat and chat not full
    if chat_id in chats:
        if (magic_key == chats[chat_id]['magic'] and len(chats[chat_id]['session_token']) < 6):
            token = generate_store_token(chat_id, username)
            return {
                "chat_id": chat_id, 
                "session_token": token,
                "magic_invite_link": "http://localhost:5000/chat/{}?magic_key={}".format(chat_id, magic_key)
            }


@app.route('/api/messages', methods=['GET', 'POST'])
def messages():
    client_token = request.headers.get('token')
    chat_id = int(request.headers.get('chat_id'))
    
    # check if the request body contains a chat_id and valid session token for that chat
    if client_token in chats[chat_id]['session_token'] and \
    chats[chat_id]['session_token'][client_token]['expiry'] > datetime.datetime.now():
        
        if request.method == 'POST':
            username = chats[chat_id]['session_token'][client_token]['username']
            msg = request.form['textarea']
            newpost = (username, msg)
            if 'messages' not in chats[chat_id]:
                chats[chat_id]['messages'] = [newpost]
            else:
                chats[chat_id]['messages'].append(newpost)
            
        # get the messages for this chat from global memory
        messages = chats[chat_id]['messages'] 
        magic_key = chats[chat_id]['magic']
        return {
            "messages": messages        
            }
        
    else:
        return make_response('Not authorised',403)


if __name__ == "__main__":
    app.run(debug=True)

