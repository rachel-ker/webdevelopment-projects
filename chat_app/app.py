'''
References
https://www.codementor.io/@adityamalviya/python-flask-mysql-connection-rxblpje73
https://flask.palletsprojects.com/en/0.12.x/tutorial/dbinit/
https://www.w3schools.com/python/python_mysql_create_db.asp
https://flask.palletsprojects.com/en/1.1.x/api/
https://stackoverflow.com/questions/19783404/enable-executing-multiple-statements-while-execution-via-sqlalchemy
https://dev.mysql.com/doc/connector-python/en/connector-python-example-cursor-select.html
https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-execute.html
https://mysqlserverteam.com/mysql-8-0-collations-migrating-from-older-collations/
https://www.w3schools.com/sql/sql_update.asp
https://www.mysqltutorial.org/mysql-delete-statement.aspx
https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
https://www.techonthenet.com/sql_server/foreign_keys/foreign_delete.php
https://pypi.org/project/bcrypt/
https://docs.python.org/3/library/configparser.html
https://www.mysqltutorial.org/mysql-json/
https://geert.vanderkelen.org/2015/mysql577-json-python/
https://stackoverflow.com/questions/444657/how-do-i-set-a-column-value-to-null-in-sql-server-management-studio

'''

from flask import Flask, render_template, request, make_response
import bcrypt

import mysql.connector
import datetime
import uuid
import os
import json

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

import configparser


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


config = configparser.ConfigParser()
config.read('secrets.cfg')

PEPPER = config['secrets']['PEPPER']
DB_HOST = 'localhost'
DB_NAME = 'rachelker'
DB_USERNAME = config['secrets']['DB_USERNAME']
DB_PASSWORD = config['secrets']['DB_PASSWORD']


@app.route('/')
@app.route('/create')
@app.route('/update_username')
@app.route('/update_email')
@app.route('/forget_password')
@app.route('/reset_password')
@app.route('/create_channel')
@app.route('/channel/')
@app.route('/channel/<int:channel_id>/')
@app.route('/channel/<int:channel_id>/<int:post_id>', methods=['GET'])
def index(channel_id=None, post_id=None):
    return app.send_static_file('index.html')

# -------------------------------- HELPER FUNCTIONS ----------------------------------
def connect_db(host=DB_HOST, user=DB_USERNAME, password=DB_PASSWORD, database=DB_NAME):
    conn = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                database=database
            )
    return conn

def hash_pw(password):
    peppered = PEPPER + password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(peppered.encode('utf-8'), salt)
    return hashed

def check_valid_token(token):
    try:
        conn = connect_db()
        cur = conn.cursor()
        query = ("SELECT id FROM users WHERE session_token = %s")
        cur.execute(query, (token,))
        row = cur.fetchone()
        if row:
            return row[0]
    
    except:
        return False
    
    finally:
        cur.close()
        conn.close()


# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/login', methods=['POST'])
def login():
    '''
    Check if user is valid and generates a session token if valid
    '''
    data = request.get_json()
    email = data['email']
    password = PEPPER + data['password']
    
    conn = connect_db()
    cur = conn.cursor()

    query = ("SELECT id, username, email, pw FROM users \
              WHERE email = %s")
    try:
        cur.execute(query, (email,))

        row = cur.fetchone()
        user_id, username, email, stored_pw = row
        if bcrypt.checkpw(password.encode('utf-8'), stored_pw.encode('utf-8')):
            token = uuid.uuid4().hex
            cur.execute("UPDATE users SET session_token = %s WHERE id = %s", (token, user_id))
            conn.commit()
            return {'id': user_id, 
                    'username': username,
                    'email': email,
                    'session_token': token
                    }
        else:
            return make_response('Incorrect Password', 403)
    
    except Exception as e:
        return make_response('Not a valid user: {}'.format(e), 403)
    
    finally:
        cur.close()
        conn.close()



@app.route('/api/create_user', methods=['POST'])
def create_user():
    '''
    Anyone can create a new user and a session token is generated
    This function adds the user into db
    '''
    data = request.get_json()
    username = data['username']
    email = data['email']
    hashed = hash_pw(data['password'])

    # generate session token
    token = uuid.uuid4().hex

    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (username, email, pw, session_token) VALUES (%s, %s, %s, %s)", (username, email, hashed, token))
        conn.commit()
        cur.execute("SELECT id, username, email FROM users WHERE username = %s and email = %s", (username, email))

        row = cur.fetchone()
        user_id, username, email = row
        
        return {'id': user_id, 
                'username': username,
                'email': email,
                'session_token': token
                }

    except Exception as e:
        return make_response('Error: {}'.format(e), 404)
    
    finally:
        cur.close()
        conn.close()


@app.route('/api/create_channel', methods=['POST'])
def create_channel():
    '''
    Anyone with a valid session token can create a new channel
    This function adds the channel into the db
    '''
    data = request.get_json()
    channel_name = data['channel_name']
    author_id = data['author_id']
    session_token = data['session_token']

    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()
        last_read = {}
        try:
            cur.execute("INSERT INTO channels (title, creator_id, last_read) VALUES (%s, %s, %s)", (channel_name, author_id, json.dumps(last_read)))
            conn.commit()
            return {'channel_name': channel_name}
        
        except Exception as e:
            return make_response('Error: {}'.format(e), 404)
        
        finally:
            cur.close()
            conn.close()
    else:
        return make_response('Invalid token', 403)
    


@app.route('/api/delete_channel', methods=['POST'])
def delete_channel():
    '''
    Allows creator of channel with a session token to delete the channel from db
    '''
    data = request.get_json()
    channel_id = data['channel_id']
    user_id = data['user_id']
    session_token = data['session_token']

    if check_valid_token(session_token):
        # verify user
        conn = connect_db()
        cur = conn.cursor()
        try:
            cur.execute('SELECT creator_id FROM channels WHERE id = %s', (channel_id,))
            result=cur.fetchone()
            if user_id == result[0]:
                # delete channel from database if user is creator
                try:
                    cur.execute("DELETE FROM channels WHERE id = %s AND creator_id = %s", (channel_id, user_id))
                    conn.commit()
                    return make_response('Success', 200)
                except Exception as e:
                    return make_response('Error: {}'.format(e), 404)
            else:
                return make_response('Unauthorized: {}'.format(e), 403)
        except Exception as e:
            return make_response('Invalid Channel ID: {}'.format(e), 406)
        finally:
            cur.close()
            conn.close()
    else:
        return make_response('Invalid token', 403)
 


@app.route('/api/update_email', methods=['POST'])
def update_email():
    '''
    User with session token can update their email in db
    '''
    data = request.get_json()
    email = data['email']
    user_id = data['user_id']
    session_token = data['session_token']
    
    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE users SET email = %s WHERE id = %s", (email, user_id))
            conn.commit()
            return {'email': email}
        except Exception as e:
            return make_response('Error: {}'.format(e), 404)
        finally:
            cur.close()
            conn.close()
    else:
        return make_response('Invalid token', 403)


@app.route('/api/update_username', methods=['POST'])
def update_username():
    '''
    User with session token can update their username in db
    '''
    data = request.get_json()
    username = data['username']
    user_id = data['user_id']
    session_token = data['session_token']

    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE users SET username = %s WHERE id = %s", (username, user_id))
            conn.commit()
            return {'username': username}
        except Exception as e:
            return make_response('Error: {}'.format(e), 404)
        finally:
            cur.close()
            conn.close()
    else:
        return make_response('Invalid token', 403)   


@app.route('/api/fetch_channels', methods=['POST'])
def fetch_channels():
    '''
    User with session token can fetch channels from db
    '''
    data = request.get_json()
    user_id = data['user_id']
    session_token = data['session_token']
    
    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()

        query1 = ('''SELECT id, title, JSON_EXTRACT(last_read,'$."%s"') as last_read 
                    FROM channels
                    ORDER BY id''')
        query2 = ("SELECT count(id) FROM messages where id>%s and channel_id =%s and isnull(replies_to)")
        cur.execute(query1, (user_id,))
        result=cur.fetchall()

        channels = []
        ids = []
        unread = []
        for channel_id, names, last_read in result:
            channels.append(names)
            ids.append(channel_id)

            if last_read is None:
                last_read=0
            
            try:
                cur.execute(query2, (last_read, channel_id))
                unread_count = cur.fetchone()[0]
                unread.append(unread_count)
            
            except Exception as e:
                return make_response('Error: {}'.format(e), 404)

        cur.close()
        conn.close()
        
        return {
                'channel_names': channels,
                'channel_ids': ids,
                'unread': unread
                }
        
    else:
        return make_response('Invalid token', 403)


@app.route('/api/fetch_messages', methods=['POST'])
def fetch_messages():
    '''
    User with session token can fetch messages of a channel from db
    '''
    data = request.get_json()
    channel_id = data['channel_id']
    session_token = data['session_token']
    
    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()

        query = ('''WITH 
                replies_agg(id, count) AS ( 
                    SELECT replies_to as id, count(replies_to) as count 
                    FROM messages 
                    WHERE channel_id=%s
                    GROUP BY replies_to 
                ), 
                post_content(id, username, body) AS (
                    SELECT messages.id, username, body 
                    FROM messages join users on messages.author_id=users.id 
                    WHERE channel_id=%s and isnull(replies_to) ORDER BY creation_time ASC
                )
                SELECT post_content.id, username, body, count
                FROM post_content LEFT JOIN replies_agg ON post_content.id=replies_agg.id
                ORDER BY post_content.id
                ''')

        try:
            cur.execute(query, (channel_id,channel_id))

            messages = []
            for msg in cur:
                messages.append(msg)
                post_id, username, body, count = msg
            if messages:
                last_post_id = post_id
            else:
                last_post_id = 0

            return {'messages': messages,
                    'last_post_id': last_post_id}
        
        except Exception as e:
            return make_response('Error {}'.format(e), 404)
        finally:
            cur.close()
            conn.close()
    else:
        return make_response('Invalid token', 403)
 


@app.route('/api/fetch_replies', methods=['POST'])
def fetch_replies():
    '''
    User with session token can fetch replies of a msg in a channel from db
    '''
    data = request.get_json()
    channel_id = data['channel_id']
    replies_to = data['replies_to']
    session_token = data['session_token']
    
    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()

        query = ('''SELECT username, body 
                    FROM messages join users on messages.author_id=users.id 
                    WHERE channel_id=%s and replies_to=%s ORDER BY creation_time ASC
                ''')

        try:
            cur.execute(query, (channel_id,replies_to))

            messages = []
            for msg in cur:
                messages.append(msg)
            return {'messages': messages}
        
        except Exception as e:
            return make_response('Error {}'.format(e), 404)
        finally:
            cur.close()
            conn.close()
    else:
        return make_response('Invalid token', 403)


@app.route('/api/update_lastread', methods=['POST'])
def update_lastread():
    '''
    User with session token can update their last read msg per channel
    '''
    data = request.get_json()
    post_id = data['post_id']
    user_id = data['user_id']
    channel_id = data['channel_id']
    session_token = data['session_token']

    if check_valid_token(session_token):
        conn = connect_db()
        cur = conn.cursor()
        try:
            cur.execute("SELECT last_read from channels WHERE id = %s", (channel_id,))
            last_read = json.loads(cur.fetchone()[0])
            last_read[user_id] = post_id

            cur.execute("UPDATE channels SET last_read = %s WHERE id = %s", (json.dumps(last_read), channel_id))
            conn.commit()
            return make_response('Success', 200)

        except Exception as e:
            return make_response('Error: {}'.format(e), 404)

        finally:
            cur.close()
            conn.close()
    
    else:
        return make_response('Invalid token', 403)   


   
@app.route('/api/forget_password', methods=['POST'])
def forget_password():
    '''
    With a valid email, a magic link will be sent to allow user to reset their password
    '''
    data = request.get_json()
    email = data['email']

    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id from users WHERE email = %s", (email,))
        row = cur.fetchone()
        if row:
            # Generate and store magic link for verification
            magic = uuid.uuid4().hex
            cur.execute("UPDATE users SET magic = %s WHERE email = %s", (magic, email))
            conn.commit()
            link = 'http://localhost:5000/reset_password?magic={}'.format(magic)

            message = Mail(
            from_email='admin@belay.com',
            to_emails=email,
            subject='Belay: Reset Password',
            html_content='Hi Belay User, please reset your password at <a href="{}">this link</a>'.format(link))

            try:
                sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
                response = sg.send(message)
                return make_response('Success', 200)
            
            except Exception as e:
                return make_response('Error: {}'.format(e), 404)

        else:
            return make_response('Invalid Email', 403)
        
    except Exception as e:
        return make_response('Error: {}'.format(e), 404)
    
    finally:
        cur.close()
        conn.close()

    
@app.route('/api/reset_password', methods=['POST'])
def reset_password():
    '''
    With a valid magic link, user can reset their password in db
    '''
    data = request.get_json()
    magic = data['magic']
    hashed = hash_pw(data['password'])
    
    conn = connect_db()
    cur = conn.cursor()
    
    try:
        query = ("SELECT email FROM users WHERE magic = %s")
        cur.execute(query, (magic,))
        email = cur.fetchone()[0]

        if email:
            try:
                # update email and magic link expires
                cur.execute("UPDATE users SET pw = %s WHERE email = %s", (hashed, email))
                cur.execute("UPDATE users SET magic = NULL WHERE email = %s", (email,))
                conn.commit()
                return make_response('Success', 200)
        
            except Exception as e:
                return make_response('Error: {}'.format(e), 404)
    
        
        else:
            return make_response('Error: invalid link', 403)

    except:
        return make_response('Error: invalid link', 403)
    
    finally:
        cur.close()
        conn.close()



@app.route('/api/new_post', methods=['POST'])
def new_post():
    '''
    With a valid session token, users can post new messages/replies
    '''
    data = request.get_json()
    session_token = data['session_token']
    
    if check_valid_token(session_token):
            
        replies_to = None
        if 'replies_to' in data:
            replies_to = data['replies_to']

        body = data['body']
        channel_id = data['channel_id']
        author_id = data['author_id']
        time = datetime.datetime.now()
        
        conn = connect_db()
        cur = conn.cursor()
        try:
            if replies_to:
                cur.execute("INSERT INTO messages (channel_id, author_id, body, replies_to, creation_time) VALUES (%s, %s, %s, %s, %s)", 
                        (channel_id, author_id, body, replies_to, time)
                        )
            else:
                cur.execute("INSERT INTO messages (channel_id, author_id, body, creation_time) VALUES (%s, %s, %s, %s)", 
                            (channel_id, author_id, body, time)
                            )
            conn.commit()
            return make_response('Success', 200)
        
        except Exception as e:
            return make_response('Error: {}'.format(e), 404)
        
        finally:
            cur.close()
            conn.close()
    
    else:
        return make_response('Invalid token', 403) 

