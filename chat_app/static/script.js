// References
// https://reactjs.org/docs/react-component.html
// https://reactjs.org/tutorial/tutorial.html
// https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
// https://reactjs.org/docs/state-and-lifecycle.html
// https://flaviocopes.com/react-how-to-loop/
// https://www.w3schools.com/jsref/jsref_substring.asp
// https://www.w3schools.com/jsref/prop_screen_width.asp
// https://www.w3schools.com/jsref/prop_win_innerheight.asp
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/@@match
// https://stackoverflow.com/questions/2143202/any-preg-match-to-extract-image-urls-from-text
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/@@matchAll
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
// https://medium.com/@sbakkila/how-to-adjust-for-react-js-sometimes-handling-state-updates-asynchronously-3a6cb725c63a
// https://blog.bitsrc.io/react-16-lifecycle-methods-how-and-when-to-use-them-f4ad31fb2282
// http://regexlib.com/Search.aspx?k=email&AspxAutoDetectCookieSupport=1
// https://stackoverflow.com/questions/940577/javascript-regular-expression-email-validation
// in class lab exercise (lecture 8/9)


// -------------------------------- SETTING PAGES ----------------------------------
function check_valid_email(email) {
    const emailexp = RegExp('^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\.([a-zA-Z]{2,5})$','g');
    return email.match(emailexp)
}

function CreateUser(props) {
    function create_user() {
        const username = document.getElementById("create-username").value;
        const email = document.getElementById("create-email").value;
        const password = document.getElementById("create-password").value;
        
        if (check_valid_email(email) && username && password) {
            fetch("/api/create_user", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: username, email: email, password: password})
              })
              .then((response) => {
                if(response.status == 200) {
                  response.json()
                  .then((data) => {
                    console.log('added user to db')
                    props.loginHandler(data.id, data.username, data.email, data.session_token);
                  });
          
                } else {
                  alert('This email address already has an account.')
                  document.getElementById("create-username").value = ''
                  document.getElementById("create-email").value = ''
                  document.getElementById("create-password").value = ''
                  console.log(response.status);
                  props.change_url("/create");
                }
              }).catch((response) =>{
                console.log(response);
                props.change_url("/create");
              })
        } else {
            alert('Missing Fields or Invalid Email')
        }
    }
        

    return (
        <div className="usercreate" id="usercreate">
            <h1>Belay Chat App</h1>
            <h2>Create your account</h2>     
            <p><label>Email: </label><input type="text" id="create-email" required></input></p>
            <p><label>Set Username: </label><input type="text" id="create-username" required></input></p>
            <p><label>Set Password: </label><input type="password" id="create-password" required></input></p>
            <p><button onClick={() => {create_user()}}>Create</button></p>
            <button className="bottombuttons" onClick={() => {props.change_url("/")}}>Try logging in instead?</button>
        </div>
    );
}


function ForgetPassword(props) {
    function forget_password() {
        const email = document.getElementById("forgetpw-email").value;

        fetch("/api/forget_password", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email})
          })
          .then((response) => {
            if(response.status == 200) {
              alert('Email sent to reset password')
              document.getElementById("forgetpw-email").value = ''
              
            } else {
              alert('Failed, is this the email for your account?')
              console.log(response.status);
            }
            }).catch((response) =>{
            console.log(response);
            });
    }
    
    return (
        <div className="userforgetpw" id="userforgetpw">
            <h1>Belay Chat App</h1>
            <h2>Forgot your Password?</h2>     
                <p><label>Email: </label><input type="text" id="forgetpw-email" required></input></p>
                <p><button onClick={() => {forget_password()}}>Reset password</button></p>
                <button className="bottombuttons" onClick={() => {props.change_url("/")}}>Try logging in instead?</button>
        </div>
    );
}


function UpdateUsername(props) {
    function update_username_db() {
        const username = document.getElementById("update-username").value;
        const user_id = props.user_id;
        const token = props.session_token;

        if (username && user_id) {
            fetch("/api/update_username", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: username, user_id: user_id, session_token: token})
              })
              .then((response) => {
                if(response.status == 200) {
                  response.json()
                  .then((data) => {
                    console.log('success, updated username')
                    props.update_username(data.username)
                  });
          
                } else {
                  alert('Failed to update username')
                  console.log(response.status);
                }
                }).catch((response) =>{
                    alert('Failed to update username')
                    console.log(response);
                });
        } else {
            alert('Did you provide a new username?')
        }
    }

    return (
        <div className="updateusername" id="updateusername">
            <h1>Belay Chat App</h1>
            <p>
                <label>Change Username: </label><input type="text" id="update-username"></input>
                <button onClick={() => {update_username_db()}}>Update</button>
            </p>
            <label>Changed your mind? </label><button className="bottombuttons" onClick={() => {props.change_url("/channel")}}>Go back to chat</button>

        </div>
    );
}


function UpdateEmail(props) {
    function update_email_db() {
        const email = document.getElementById("update-email").value;
        const user_id = props.user_id;
        const token = props.session_token;

        if (check_valid_email(email) && user_id) {
            fetch("/api/update_email", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email, user_id: user_id, session_token: token})
              })
              .then((response) => {
                if(response.status == 200) {
                  response.json()
                  .then((data) => {
                    console.log('success, updated email')
                    props.update_email(data.email)
                  });
          
                } else {
                  alert('Failed to update email')
                  console.log(response.status);
                }
                }).catch((response) =>{
                    alert('Failed to update email')
                    console.log(response);
                });
        } else {
            alert('Missing or invalid email')
        }
    }

    return (
        <div className="updateemail" id="updateemail">
            <h1>Belay Chat App</h1>
            <p>
                <label>Change Email: </label><input type="text" id="update-email"></input>
                <button onClick={() => {update_email_db()}}>Update</button>
            </p>
            <label>Changed your mind? </label><button className="bottombuttons" onClick={() => {props.change_url("/channel")}}>Go back to chat</button>
        </div>
    );
}


function ResetPassword(props) {
    function update_pw_in_db() {
        const password = document.getElementById("reset-password").value;
        const magic = window.location.search.substring(7,)

        if (password && magic) {
            fetch("/api/reset_password", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({password: password, magic: magic})
              })
              .then((response) => {
                if(response.status == 200) {
                    console.log('success, password reset')  
                    props.change_url('/')
                } else {
                  alert('Failed to reset password')
                  console.log(response.status);
                }
                }).catch((response) =>{
                    alert('Failed to reset password')
                    console.log(response);
                });
        } else {
            alert('Invalid magic link')
        }
    }
    return (
        <div className="resetpassword" id="resetpassword">
            <h1>Belay Chat App</h1>
            <h2>Reset Password</h2>     
                <p><label>New Password: </label><input type="password" id="reset-password"></input></p>
                <p><button onClick={() => {update_pw_in_db()}}>Reset</button></p>
        </div>
    );
}


// -------------------------------- LOGIN ----------------------------------

function Login(props) {
    function login() {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        if (email && password) {
            fetch("/api/login", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email, password: password})
                })
                .then((response) => {
                if(response.status == 200) {
                    console.log('login successfully')
                    response.json()
                    .then((data) => {
                    props.loginHandler(data.id, data.username, data.email, data.session_token);
                    });
            
                } else {
                    alert('Failed to Login')
                    logout();
                }
                }).catch((response) =>{
                    alert('Failed to Login')
                    logout();
                })
        } else {
            alert("Missing email or password");
        }
    }
            
    function logout() {
        props.logoutHandler();
      }
    
    function loginListener(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            login();
        } 
    }
    
    return (
    <div className="userlogin" id="userlogin">
        <h1>Belay Chat App</h1>
        <h2>Login</h2>     
            <p><label>Email: </label><input type="text" id="login-email" onKeyPress={loginListener} required></input></p>
            <p><label>Password: </label><input type="password" id="login-password" onKeyPress={loginListener} required></input></p>
            <p><button onClick={() => {login()}}>Login</button></p>
        <p><button className="bottombuttons" onClick={() => {props.change_url("/create")}}>Create an account?</button></p>
        <p><button className="bottombuttons" onClick={() => {props.change_url("/forget_password")}}>Forgot your password?</button></p>
    </div>
    );
}


// -------------------------------- CHAT PAGE - CREATE NEW CHANNEL ----------------------------------

function CreateChannel(props) {
    function add_channel_to_db() {
        const channel_name = document.getElementById("channelname").value;
        const author_id = props.user_id;
        const token = props.session_token;

        if (channel_name && author_id) {
            fetch("/api/create_channel", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({channel_name: channel_name, author_id: author_id, session_token: token})
              })
              .then((response) => {
                if(response.status == 200) {
                    console.log('success, added channel to db')
                    document.getElementById("channelname").value = ''
                } else {
                  alert('Error in creating channel. Try another name or something shorter.')
                  console.log(response.status);
                }
                }).catch((response) =>{
                    alert('Failed to create channel')
                    console.log(response);
                });
        } else {
            alert('Missing Channel Name')
        }
    }

    function createListener(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            add_channel_to_db();
        } 
    }
    
    return (
        <div className="createchannel">
            <h2>Create new channel</h2>
            <p><label>Channel Name: </label><input type="text" id="channelname" onKeyPress={createListener} required></input></p>
            <p><button onClick={() => {add_channel_to_db()}}>Create</button></p>
            {window.innerWidth <= 800 | screen.width <= 800 ? 
            <button className="bottombuttons" onClick={() => {props.back_to_channels()}}>Back to Channels</button>
                : null}
        </div>
    );
}


// -------------------------------- CHAT PAGE - SIDE BAR ----------------------------------

function ChannelList(props) {
    return (
        <button className="channels" onClick={() => {props.update_current_channel(props.id, props.name)}}>
            {props.name} 
            {props.unread_count > 0 ? <span className="unread_count">{props.unread_count}</span>: null}
        </button>
    );
}

function Sidebar(props) { 
    const channel_list = props.channel_names;
    return (
        <div className="sidebar" id="sidebar">
            <div className="user_info">
                <p><button className="user_button" onClick={() => {props.change_url("/update_username")}}>Welcome {props.username}</button></p>
                <p><button className="user_button" onClick={() => {props.change_url("/update_email")}}>{props.email}</button></p>
                <button className="logout_button" onClick={() => {props.logoutHandler()}}>Logout</button>
            </div>

            <p>Channels<button className="add_channel" onClick={() => {props.load_create_channel()}}>+</button></p>
            {channel_list.map((name, index) => {
                return <ChannelList 
                            key={props.channel_ids[index]}
                            name={name} 
                            id={props.channel_ids[index]} 
                            update_current_channel={props.update_current_channel}
                            unread_count={props.unread[index]}
                            />
            })}
        </div>
    );
}  


// -------------------------------- CHAT PAGE - MAIN CHAT ----------------------------------

function Message(props) { 
    function generate_reply_count(reply_count) {
        if ((reply_count === null) | (reply_count <= 0)) {
            return 
        }
        else if (reply_count == 1) {
            return "1 reply"
        }
        else {
            return reply_count + " replies"
        }
    }

    const post_id = props.msg[0];
    const username = props.msg[1];
    const text = String(props.msg[2]);
    const text_mini = text.substring(0,50);
    const reply_count = props.msg[3];

    const regexp = RegExp('https?://[A-Za-z0-9\-\.\/_=:(),%!@#$^&*+{}|;<>]+\.(?:p?jpe?g|a?png|gif|bmp|ico|cur|jfif|pjp|svg|tiff?|webp)','g');
    let array = [...text.matchAll(regexp)];

    return (
        <div className="single_post">
            <button className="post_button" onClick={() => {props.update_current_post(props.channel_id, post_id, text_mini)}}>
                <div className="post"> 
                    <p><b>{username}</b></p>
                    <p>{text}</p>
                    {array.length >= 1 ? 
                    array.map((url, index) => {
                        return <img className="post_pics" key={index} src={url[0]}></img>
                    }) : null}
                </div>
            </button>
            {generate_reply_count(reply_count) ? 
                <button className="reply_button" onClick={() => {props.update_current_post(props.channel_id, post_id, text_mini)}}>
                    {generate_reply_count(reply_count)}
                </button>
                : null}
        </div>  
    );
}


function CurrentChannel(props) {     
    function delete_channel_from_db(user_id, channel_id) {
        fetch("/api/delete_channel", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({  user_id: user_id, 
                                    channel_id: channel_id, 
                                    session_token: props.session_token})
        })
        .then((response) => {
            if(response.status == 200) {
                console.log('success, channel deleted')
                props.update_current_channel('','')
                props.close_reply_thread('')
            } else {
                console.log('failed')
            }
            });
    }

    function generate_unread_count(unread) {
        if ((unread === null) | (unread <= 0)) {
            return 
        }
        else if (unread == 1) {
            return "1 new message"
        }
        else {
            return unread + " new messages"
        }
    }

    const msg = props.messages;
    const ids = props.channel_ids;
    const index = ids.findIndex(channel_id => channel_id === props.channel_id)
    const unread_count = props.unread[index]
    return (
        <div className='current_channel'>
            {props.channel_id ? 
            <div className="chat_form">
                <h2 className='channel_title'>
                    {window.innerWidth <= 800 | screen.width <= 800 ?
                        <button className="delete_channel" onClick={() => {props.back_to_channels()}}>x</button>
                        : null
                    }
                    {props.channel_name}     
                    <button 
                        className="delete_channel" 
                        onClick={() => {delete_channel_from_db(props.user_id, props.channel_id)}}>Delete Channel</button>
                </h2>
                {msg.map((msg,index) => {
                    return <Message 
                            key={index}
                            msg={msg}
                            channel_id={props.channel_id}
                            update_current_post={props.update_current_post}
                            />
                })}
                {generate_unread_count(unread_count) ? 
                    <button className="unread_notif" onClick={() => {props.fetch_messages(props.channel_id)}}>
                        {generate_unread_count(unread_count)}
                    </button> 
                    : null}   
            </div>
            : null}
        </div>
    );
}



function MainChat(props) { 
    function create_new_post() {
        const body = document.getElementById("post-textarea").value;
        const author_id = props.user_id;
        const channel_id = props.current_channel_id;
        const token = props.session_token;

        if (channel_id) {
            fetch("/api/new_post", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({body: body, channel_id: channel_id, author_id: author_id, session_token: token})
            })
            .then((response) => {
                if(response.status == 200) {
                    console.log('success, new post added')
                    document.getElementById("post-textarea").value = ''
                    props.fetch_messages(channel_id);
                    } else {
                        console.log('failed')
                    }
                }).catch((response) => {
                    console.log('failed')
                });
        } else {
            console.log("channel id required")
        }
    }

    function back_to_channels() {
        document.getElementById('main_chat').style.display = "none";
        document.getElementById('sidebar').style.display = "flex";
        props.change_url('/channels')
    }

    function postListener(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            create_new_post();
        } 
    }

    return (
        <div className="main_chat" id="main_chat">
            <div className="chat" id="chat">
                {props.creatingchannel ? 
                    <CreateChannel  user_id={props.user_id}
                                    back_to_channels={back_to_channels}
                                    session_token={props.session_token}
                                    /> :
                    <CurrentChannel channel_name={props.current_channel_name}
                                    channel_id={props.current_channel_id}
                                    user_id={props.user_id} 
                                    update_current_channel={props.update_current_channel}
                                    close_reply_thread={props.close_reply_thread}
                                    change_url={props.change_url}
                                    update_current_post={props.update_current_post}
                                    back_to_channels={back_to_channels}
                                    session_token={props.session_token}
                                    update_last_read={props.update_last_read}
                                    channel_ids={props.channel_ids}
                                    unread={props.unread}
                                    messages={props.messages}
                                    fetch_messages={props.fetch_messages}
                                    />
                }        
            </div>    
            {props.current_channel_id ?
            <div className="newpost" id="newpost_chat">
                <textarea className="textarea" id="post-textarea" name="textarea" onKeyPress={postListener}></textarea>
            </div>
            :null}
        </div>
    );
} 

// -------------------------------- CHAT PAGE - REPLIES ----------------------------------

function Reply(props) {
    const username = props.replies[0]
    const text = props.replies[1]

    const regexp = RegExp('https?://[A-Za-z0-9\-\.\/_=:(),%!@#$^&*+{}|;<>]+\.(?:p?jpe?g|a?png|gif|bmp|ico|cur|jfif|pjp|svg|tiff?|webp)','g');
    let array = [...text.matchAll(regexp)];

    return (
        <div className="reply"> 
            <p><b>{username}</b></p>
            <p>{text}</p>
            {array.length >= 1 ? 
            array.map((url, index) => {
                return <img className="post_pics" key={index} src={url[0]}></img>
            }) : null}
        </div>

    );
}

function Replies(props) {   
    function create_new_reply() {
        const body = document.getElementById("reply-textarea").value;
        const author_id = props.user_id;
        const channel_id = props.current_channel_id;
        const replies_to = props.current_post_id;
        const token = props.session_token;

        if (channel_id) {
            fetch("/api/new_post", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({  body: body, 
                                        channel_id: channel_id, 
                                        author_id: author_id, 
                                        replies_to: replies_to,
                                        session_token: token
                                        })
            })
            .then((response) => {
                if(response.status == 200) {
                    console.log('success, new reply added')
                    document.getElementById("reply-textarea").value = ''
                    props.fetch_replies(channel_id, replies_to)
                    props.fetch_messages(channel_id)
                    } else {
                        console.log('failed')
                    }
                }).catch((response) => {
                    console.log('failed')
                });
        } else {
            console.log("channel id required")
        }
    }

    function replyListener(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            create_new_reply();
        } 
    }

    const replies = props.replies;

    return (
        <div className="reply_page" id="reply_page">
            <div className="reply_container">
                <div className="replies" id="replies">
                    <h2 className='channel_title'>
                        Reply to: {props.current_post_body}
                        <button className="delete_channel" onClick={() => {props.close_reply_thread(props.current_channel_id)}}>x</button>
                    </h2>
                    {replies.map((replies,index) => {
                        return <Reply 
                                key={index}
                                replies={replies}
                                />
                    })}
                </div>
            </div>
                
            <div className="newpost" id="newpost_reply">
                <textarea className="textarea" id="reply-textarea" name="textarea" onKeyPress={replyListener}></textarea>
            </div>
        </div>
    );
}



// -------------------------------- CHAT ----------------------------------


class Chat extends React.Component {    
    constructor(props) {
        super(props);
        this.state = {
            creatingchannel: false,
            current_channel_name: null,
            current_channel_id: null,
            current_post_id: null,
            current_post_body: null,
            openreplythread: false,
            messages: [],
            replies: []
        }
    }

    componentDidMount() {
        this.fetchChannelsTimer = setInterval(
          () => this.props.fetch_channels(this.props.user_id),
          1000
        );
      }
    
    componentWillUnmount() {
        clearInterval(this.fetchChannelsTimer);
    }

    update_current_channel = (channel_id, channel_name) => {
        const new_path = "/channel/" + channel_id
        if (window.innerWidth <= 800 | screen.width <= 800) {
            document.getElementById('sidebar').style.display = "none";
            if (document.getElementById('main_chat')) {
                document.getElementById('main_chat').style.display = "block";
            }
        }
        this.setState({ creatingchannel: false,
            current_channel_name: channel_name,
            current_channel_id: channel_id})
        this.props.change_url(new_path)
        this.fetch_messages(channel_id)   
    }
        
    fetch_messages = (channel_id) => {
        const chat_div = document.getElementById('chat');
        fetch("/api/fetch_messages", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({channel_id: channel_id, 
                                  session_token: this.props.session_token})
        })
          .then((response) => {
            if(response.status == 200) {
              response.json()
              .then((data) => {
                  this.props.update_last_read(  channel_id, 
                                                data.last_post_id, 
                                                this.props.user_id, 
                                                this.props.session_token
                                                )
                  this.setState({messages: data.messages})
                  // scroll to bottom of chat
                  chat_div.scrollTop = chat_div.scrollHeight;
              });
            
            } else {
                console.log('failed')
            } 
          });
    }

    update_current_post = (channel_id, post_id, post_body) => {
        const new_path = "/channel/" + channel_id + '/' + post_id

        if (window.innerWidth <= 800 | screen.width <= 800) {
            document.getElementById('main_chat').style.display = "none";
            if (document.getElementById('reply_page')) {
                document.getElementById('reply_page').style.display = "block";
            }
        }

        this.setState({ openreplythread: true,
                        current_post_id: post_id,
                        current_post_body: post_body })        
        this.props.change_url(new_path)
        this.fetch_replies(channel_id, post_id)
    }

    fetch_replies = (channel_id, post_id) => {
        fetch("/api/fetch_replies", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({channel_id: channel_id,
                                  replies_to: post_id,
                                  session_token: this.props.session_token})
        })
          .then((response) => {
            if(response.status == 200) {
              response.json()
              .then((data) => {
                  this.setState({replies: data.messages})
              });
            
            } else {
                console.log('failed')
            } 
          });
    }

    close_reply_thread = (channel_id) => {
        const new_path = "/channel/" + channel_id

        if (window.innerWidth <= 800 | screen.width <= 800) {
            document.getElementById('main_chat').style.display = "block";
        }

        this.setState({openreplythread: false,
                       current_post_id: null,
                       current_post_id: null})
        this.props.change_url(new_path)
    }

    load_create_channel = () => {
        this.props.change_url('/channel')
        this.setState({ creatingchannel: true,
                        current_channel_id: null,
                        current_channel_name: null,
                        current_channel_id: null,
                        current_post_id: null,
                        current_post_body: null,
                        openreplythread: false});

        if (window.innerWidth <= 800 | screen.width <= 800) {
            document.getElementById('sidebar').style.display = "none";
            document.getElementById('main_chat').style.display = "block";
        }
    }

    render() {
        return (
            <div className="chat_container" id="chat_container">
                <div className="chatpage">
                    <Sidebar 
                    change_url={this.props.change_url}
                    logoutHandler={this.props.logoutHandler}
                    channel_names={this.props.channel_names}
                    channel_ids={this.props.channel_ids}
                    load_create_channel={this.load_create_channel}
                    update_current_channel={this.update_current_channel}
                    username={this.props.username}
                    email={this.props.email}
                    unread={this.props.unread}
                    />
                    
                    {this.state.current_channel_id | this.state.creatingchannel ?
                        <MainChat
                        creatingchannel={this.state.creatingchannel}
                        user_id={this.props.user_id}
                        current_channel_name={this.state.current_channel_name}
                        current_channel_id={this.state.current_channel_id}
                        change_url={this.props.change_url}
                        update_current_channel={this.update_current_channel}
                        update_current_post={this.update_current_post}
                        close_reply_thread={this.close_reply_thread}
                        session_token={this.props.session_token}
                        update_last_read={this.props.update_last_read}
                        unread={this.props.unread}
                        channel_ids={this.props.channel_ids}
                        messages={this.state.messages}
                        fetch_messages={this.fetch_messages}
                        />:
                        null}
                    
                    {this.state.openreplythread ? 
                        <Replies
                        user_id={this.props.user_id}
                        current_post_id={this.state.current_post_id}
                        current_post_body={this.state.current_post_body}
                        current_channel_id={this.state.current_channel_id}
                        close_reply_thread={this.close_reply_thread}
                        session_token={this.props.session_token}
                        replies={this.state.replies}
                        fetch_messages={this.fetch_messages}
                        fetch_replies={this.fetch_replies}
                        />
                        : 
                        null }
                </div>
            </div>
        );
    }
}


// -------------------------------- THE APP PUT TOGETHER ----------------------------------
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            urlpath: '/',
            isloggedin: false,
            session_token: '',
            user_id: '',
            username: '',
            email: '',
            channel_names: [],
            channel_ids: [],
            unread: []
        }
    }
    
    loginHandler = (id, username, email, token) => {
        console.log(id, username, email, token)
        this.setState({isloggedin: true,
                        user_id: id,
                        username: username,
                        email: email,
                        session_token: token           
        })
        this.fetch_channels(this.state.user_id);
    }

    logoutHandler = () => {
        console.log('logged out')
        history.pushState('','','/');
        this.setState({ urlpath: '/',
                        isloggedin: false,
                        user_id: '',
                        username: '',
                        email: '',
                        session_token: ''
                    });
    }

    change_url = (path) => {
        history.pushState('','',path);
        this.setState({urlpath: path});
    }

    update_email = (email) => {
        history.pushState('','','/channel');
        this.setState({urlpath: '/channel',
                       email: email});
        
    } 

    update_username = (username) => {
        history.pushState('','','/channel');
        this.setState({urlpath: '/channel',
                       username: username});
        
    } 

    update_last_read = (channel_id, post_id, user_id, session_token) => {
        fetch("/api/update_lastread", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({  session_token: session_token, 
                                    channel_id: channel_id,
                                    user_id: user_id,
                                    post_id: post_id
                                    })
            })
            .then((response) => {
            if(response.status != 200) {
                console.log('error in updating last read')
            }
        });       
    }
    

    fetch_channels = (user_id) => {
        fetch("/api/fetch_channels", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({  session_token: this.state.session_token, 
                                    user_id: user_id
                                    })
            })
          .then((response) => {
            if(response.status == 200) {
              response.json()
              .then((data) => {
                this.setState({channel_names: data.channel_names,
                               channel_ids: data.channel_ids,
                               unread: data.unread
                            });
              });
            } 
          })
        }

    render() {
        if (window.location.pathname == '/reset_password') {
            return <ResetPassword 
                    change_url={this.change_url}
                    />

        } else if (this.state.isloggedin && this.state.urlpath == '/update_username') {
            return <UpdateUsername 
                    change_url={this.change_url}
                    user_id={this.state.user_id}
                    update_username={this.update_username}
                    session_token={this.state.session_token}
                    />

        } else if (this.state.isloggedin && this.state.urlpath == '/update_email') {
            return <UpdateEmail 
                    change_url={this.change_url}
                    user_id={this.state.user_id}
                    update_email={this.update_email}
                    session_token={this.state.session_token}
                    />
        
        } else if (this.state.isloggedin && this.state.urlpath.includes('/channel/')) {
            return <Chat 
                    change_url={this.change_url}
                    user_id={this.state.user_id}
                    username={this.state.username}
                    email={this.state.email}
                    logoutHandler={this.logoutHandler}
                    fetch_channels={this.fetch_channels}
                    channel_names={this.state.channel_names}
                    channel_ids={this.state.channel_ids}
                    session_token={this.state.session_token}
                    update_last_read={this.update_last_read}
                    unread={this.state.unread}

                    />
            
        } else if (this.state.isloggedin) {
            history.pushState('', '', '/channel')
            return <Chat 
                    change_url={this.change_url}
                    user_id={this.state.user_id}
                    username={this.state.username}
                    email={this.state.email}
                    logoutHandler={this.logoutHandler}
                    fetch_channels={this.fetch_channels}
                    channel_names={this.state.channel_names}
                    channel_ids={this.state.channel_ids}
                    session_token={this.state.session_token}
                    update_last_read={this.update_last_read}
                    unread={this.state.unread}
                    />

        } else if (this.state.urlpath == '/create') {
            return <CreateUser 
                    change_url={this.change_url}
                    loginHandler={this.loginHandler}
                    logoutHandler={this.logoutHandler}
                    />

        } else if (this.state.urlpath == '/forget_password') {
            return <ForgetPassword 
                    change_url={this.change_url}
                    />

        } else {
            // any other url goes back to '/'
            history.pushState('','',this.state.urlpath)
            return <Login 
                    change_url={this.change_url}
                    loginHandler={this.loginHandler}
                    logoutHandler={this.logoutHandler}
                    /> 
        }
    }        
    
}



// -------------------------------- PUTTING EVERYTHING TOGETHER ----------------------------------
console.log("dom render");

ReactDOM.render(
    React.createElement(App),
    document.getElementById('root')
    );

console.log("end")




