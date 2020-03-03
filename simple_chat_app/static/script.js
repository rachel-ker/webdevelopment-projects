// References
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://stackoverflow.com/questions/46640024/how-do-i-post-form-data-with-fetch-api
// https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
// https://www.w3schools.com/js/js_window_location.asp
// https://javascript.info/regexp-lookahead-lookbehind
// https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
// https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
// https://stackoverflow.com/questions/7063627/force-scrollbar-to-bottom



check_url()
setInterval(display_chat_page, 300);


// Submit on Enter
var textarea = document.getElementById("textarea");
textarea.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("submitpost").click();
    textarea.value = ''
  }
});


// check if authorised to see chat
function display_chat_page() {
    var chat_id = get_chatid_from_url();
    if (JSON.parse(localStorage.getItem(chat_id))) {
        var session_token = JSON.parse(localStorage.getItem(chat_id))['session_token'];

        check_authorised(chat_id, session_token); 
        } 
    }   

// function to show page based on url
function check_url() {   
    var create = document.getElementById('create');
    var join = document.getElementById('join');
    var chat = document.getElementById('chatpage');
    
    if (window.location.pathname == '/') {
        create.style.display = 'block';
        join.style.display = 'none';
        chat.style.display = 'none';

    } else if (window.location.search.includes("magic_key")) {
        create.style.display = 'none';
        join.style.display = 'block';
        chat.style.display = 'none';

    } else if (window.location.pathname.includes('chat/')) { 
        create.style.display = 'none';
        join.style.display = 'none';
        chat.style.display = 'block';

 
    } else {
        history.pushState('','','/');
    }

}


// -------- Utility Functions 

// display messages - list of (user, post)
function display_messages(messages) {
    var post_num = document.getElementById("chat").childNodes.length;

    messages.slice(post_num-1).forEach(singlepost => {
        // only display new messages
        [user, msg] = singlepost;
        var div_post = document.createElement('div');
        div_post.setAttribute('class', 'post');
        div_post.innerHTML = `<b>${user}: </b>`;
        var post_text = document.createTextNode(`${msg}`)
        div_post.appendChild(post_text)

        var chat_div = document.getElementById('chat');
        chat_div.appendChild(div_post)
        // adjust scroll if there is new post
        chat_div.scrollTop = chat_div.scrollHeight;
    });
}


function get_chatid_from_url() {
    if (window.location.pathname.match('\(?<=chat\/\)[0-9]+')) {
        return window.location.pathname.match('\(?<=chat\/\)[0-9]+')[0];
    }
}

function get_magickey_from_url(){
    if (window.location.search.match('\(?<=\=\)[A-Za-z0-9]+')) {
        return window.location.search.match('\(?<=\=\)[A-Za-z0-9]+')[0]
    }
}

function add_magic_link() {
    var chat_id = get_chatid_from_url();
    var magic_invite_link = JSON.parse(localStorage.getItem(chat_id))['magic_link'];
    var magic_link = document.getElementById('magic_link');
    magic_link.innerHTML = `Use this link to invite up to 5 friends to join you: <a href=${magic_invite_link}>${magic_invite_link}</a>`;
}


// -------- Functions to fetch request

// check if valid token, GET messages
function check_authorised(chat_id, session_token) {
    console.log('Checking authorisation to get messages')
    if (session_token) {
        fetch("/api/messages", {
            method: 'GET', 
            headers: {'token': session_token,
                      'chat_id': chat_id}
        })
        .then((response) => {
            if (response.status != 200) {
                return False
            }  else {
                return response.json()
            }          
        })
        .then((response) => {
            var messages = response.messages; 
            add_magic_link();
            display_messages(messages);
        });
    }
}


// activate onclick with the create chat form.
function create_chat(event, form) {
    console.log('creating chat')
    event.preventDefault();
    fetch("/api/create", {method: 'POST', body: new FormData(form)})
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        var chat_id = response.chat_id;
        var session_token = response.session_token;
        var magic_invite_link = response.magic_invite_link;
        // store session token
        var store_info = {'session_token': session_token, 'magic_link': magic_invite_link};
        localStorage.setItem(chat_id, JSON.stringify(store_info));

        // redirect to chat page and check url
        history.pushState('','',`/chat/${chat_id}`);
        check_url();
    });
}

// activate onclick with the join chat form.
function join_chat(event, form) {
    console.log('joining chat')
    event.preventDefault();
    var chat_id = get_chatid_from_url();
    
    var stored_info = JSON.parse(localStorage.getItem(chat_id));
    if (stored_info) {
        var token = JSON.parse(localStorage.getItem(chat_id))['session_token'];
        document.getElementById('existing_token').value = token;
    } 
    document.getElementById('join_chat_id').value = chat_id;
    document.getElementById('join_magic_key').value = get_magickey_from_url();
    fetch("/api/authenticate", {method: 'POST', 
                                body: new FormData(form)
                                })
    .then(
        (response) => { if (response.ok) {
            return response.json()
        } else if (response.status==307) {
            // redirect to chat page and check url
            history.pushState('','',`/chat/${chat_id}`);
            check_url();
            return None
        } else {
            history.pushState('','','/');
            check_url();
            return None
        }
    })
    .then((response) => {
        var session_token = response.session_token;
        var chat_id = response.chat_id;
        var magic_invite_link = response.magic_invite_link;
        // store session token
        var store_info = {'session_token': session_token, 'magic_link': magic_invite_link};
        localStorage.setItem(chat_id, JSON.stringify(store_info));

        // chat page
        history.pushState('','',`/chat/${chat_id}`);
        check_url();
    
    })
}

// activate onclick with the create chat form.
function post(event, form) {
    console.log('post new message')
    event.preventDefault();
    var chat_id = get_chatid_from_url()
    var session_token = JSON.parse(localStorage.getItem(chat_id))['session_token']

    fetch("/api/messages", {method: 'POST', 
                            body: new FormData(form),
                            headers: { 'token': session_token,
                                       'chat_id': chat_id }
                            })
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        var messages = response.messages;        
        add_magic_link()
        display_messages(messages)
    });
}
