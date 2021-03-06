import React, { Component } from 'react';
import './App.css';
import {Switch,Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js/';
import CinemaList from './components/CinemaList';
import DiscoverList from './components/DiscoverList';
import ReviewList from './components/ReviewList';
import Notification from './components/Notification';
import Add from './components/Add';
import Add1 from './components/Add1';
import Register from './components/Register';
import Login from './components/Login';
import {base, firebase, fireAuth} from "./config/fire";
import withAuthProtection from './config/WithAuthProtection';
const randomId = require('random-id');

const leng = 30;
 
// pattern to determin how the id will be generated
// default is aA0 it has a chance for lowercased capitals and numbers
const pattern = 'aA0'
 

const ProtectedAdd1 = withAuthProtection("/login")(Add1);


class App extends Component {

  constructor() {
    super();
    console.log("user", fireAuth.currentUser);
    
    
    this.state = {
      me: JSON.parse(localStorage.getItem('me')),
      logState: false,
      err: false,
      submitting: false,
      user: JSON.parse(localStorage.getItem('user')),
      posts:{},
      allposts:JSON.parse(localStorage.getItem('allposts')),
      progress: 0,
      submitted:false,
      userSettings: JSON.parse(localStorage.getItem('settings'))
    };
  }

  componentDidMount() {
 
    fireAuth.onAuthStateChanged(me => {
      if (me) {

        localStorage.setItem('me', JSON.stringify(me));
        const value = this.state.me !== null ? true : false;
        this.setState({ 
        me,
        logState: value
      });
      

    this.ref = base.syncState(`Users/${JSON.parse(localStorage.getItem('me')).uid}`, {
        context: this,
        state: "user"
    });
  
    this.ref1 = base.syncState(`Posts/${JSON.parse(localStorage.getItem('me')).uid}`, {
      context: this,
      state: "posts"
    });

    firebase.database().ref(`Users/${JSON.parse(localStorage.getItem('me')).uid}`).on('value',(snap) => {
      let userSettings = snap.val()
      localStorage.setItem('settings', JSON.stringify(userSettings))
      this.setState({userSettings})
    })


    }  
  });

  firebase.database().ref('Posts').on('value',(snap)=>{ 
      let allposts = snap.val()
      localStorage.setItem('allposts', JSON.stringify(allposts));
      this.setState({allposts})
  });

  
  

    
}

  

  handleSignIn = history => (email, password) => {
    this.setState({err:false})
    this.setState({submitting:true})
    return fireAuth.signInWithEmailAndPassword(email, password).then(() => {
      this.setState({logState:true })
      this.setState({submitting:false})
      return history.push("/");
      
    },
    err => {
      this.setState({submitting:false})
      this.setState({err: true})
      console.log("error", err)
    }
    
    );

  };
  
  handleSignUp = history => (email, password) => {
    this.setState({err:false})
    this.setState({submitting:true})
    return fireAuth.createUserWithEmailAndPassword(email, password).then(() => {
      this.setState({submitting:false})
      return history.push("/add");
    },
    err => {
      this.setState({submitting:false})
      this.setState({err: true})
      console.log("error", err)
    }
    );
  };
  

  SignOut = history => () => {
    return fireAuth.signOut().then( () => {
      localStorage.removeItem('me')
      localStorage.removeItem('user')
      return history.push("/")

    })
  }

  AddData = (evt, history) => {
    evt.preventDefault();
    let that = this;
    console.log("collected")
    let fullname = document.getElementById("fullname").value;
    let username = document.getElementById("username").value;
    let pics = document.getElementById("myFile").files[0]
    let role = document.getElementById('role').value;
    console.log(pics)

    if (pics !== undefined) {

    // Create a root reference
    const storageRef = firebase.storage().ref();

    // File or Blob named mountains.jpg
    const file = pics

    // Create the file metadata
    const metadata = {
      contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    const uploadTask = storageRef.child('images/' + file.name).put(file, metadata);


    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    that.setState({progress})
    // eslint-disable-next-line default-case
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, (error) => {

  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
  // eslint-disable-next-line default-case
  switch (error.code) {
    case 'storage/unauthorized':
      // User doesn't have permission to access the object
      break;

    case 'storage/canceled':
      // User canceled the upload
      break;

    case 'storage/unknown':
      // Unknown error occurred, inspect error.serverResponse
      break;
  }
}, () => {
  // Upload completed successfully, now we can get the download URL
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    console.log('File available at', downloadURL);
  

    const user = {
      fullname,
      username,
      pics:downloadURL,
      role,
      email: JSON.parse(localStorage.getItem('me')).email
    }

    if (user) {
      console.log(that)
      that.setState({user:user})
      history.push('/')
    }

  });
});

    }

    const user = {
      fullname,
      username,
      role,
      email: JSON.parse(localStorage.getItem('me')).email
    }

    if (user) {
      console.log(that)
      that.setState({user:user})
      history.push('/')
    }

    
  }

  AddData1 = (evt, history) => {
    let that = this;
    let title,cinema,amount,viewingt,post
    evt.preventDefault();
    
    if (this.state.userSettings.role === 'Seller') {
      title = document.getElementById("title").value;
      cinema = document.getElementById("cinema").value;
      amount = document.getElementById("amount").value;
      viewingt = document.getElementById('view').value;
    }

    let video = document.getElementById("myFile").files[0];
    let caption = document.getElementById("caption").value;
    
    let comments = [];
    let likes = 0;
    let dislikes = 0;
    const posttime = Date.now()

  

    // Create a root reference
    const storageRef = firebase.storage().ref();

     // Create the file metadata
     const metadata = {
      contentType: 'mp4'
    };

    const le = 10;
    const vid = randomId(le, pattern)


    // File or Blob named mountains.jpg
    const file = video

    // Upload file and metadata to the object 'images/mountains.jpg'
    const uploadTask = storageRef.child('videos/' + vid).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    that.setState({progress})
    // eslint-disable-next-line default-case
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, (error) => {

  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
  // eslint-disable-next-line default-case
  switch (error.code) {
    case 'storage/unauthorized':
      // User doesn't have permission to access the object
      break;

    case 'storage/canceled':
      // User canceled the upload
      break;

    case 'storage/unknown':
      // Unknown error occurred, inspect error.serverResponse
      break;
  }
}, () => {
  // Upload completed successfully, now we can get the download URL
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    console.log('File available at', downloadURL);
    console.log('time',posttime)
    const id = randomId(leng, pattern)

    if (that.state.userSettings.role === 'Seller') {
      post = {
        video:downloadURL,
        caption,
        title,
        view:0,
        comments,
        likes,
        dislikes,
        cinema,
        amount,
        viewingt,
        email: JSON.parse(localStorage.getItem('me')).email,
        key:id,
        postt:posttime,
        pics: that.state.user.pics,
        fullname: that.state.user.fullname,
        meid:JSON.parse(localStorage.getItem('me')).uid,
        likeList:["nothing"],
        dislikeList:["nothing"],
        role: JSON.parse(localStorage.getItem('settings')).role,
      }
  

    }else {
      post = {
        video:downloadURL,
        caption,
        title:"",
        view:0,
        comments,
        likes,
        dislikes,
        cinema:"",
        amount:"",
        viewingt:"",
        email: JSON.parse(localStorage.getItem('me')).email,
        key:id,
        postt:posttime,
        pics: that.state.user.pics,
        fullname: that.state.user.fullname,
        meid:JSON.parse(localStorage.getItem('me')).uid,
        likeList:["nothing"],
        dislikeList:["nothing"],
        role: JSON.parse(localStorage.getItem('settings')).role
      }
    }

    if (post) {
      console.log(that)
      let posts = {...that.state.posts}
      posts[id] = post
      that.setState({posts})
      history.push('/')
    }

  });
});

    

  }


  addLikes = (meid,key,user_meid) => {
    console.log('like')
    let likes
    let likeList
    let post
    
    firebase.database().ref(`Posts/${meid}/${key}`).on('value',(snap)=>{ 
      console.log("data", snap.val());
      likes = snap.val().likes
      likeList = snap.val().likeList
  });
  
  if ( likeList.indexOf(user_meid) !== -1){
    likes = likes - 1
    let index = likeList.indexOf(user_meid)
    likeList.splice(index,1)
    post = {
      likes: likes,
      likeList : likeList
    }
   
  }else {
    likes = likes + 1

    post = {
      likes: likes,
      likeList:  [...likeList, user_meid],
    }
  }


  console.log(post)
  firebase.database().ref(`Posts/${meid}/${key}`).update(post)
  }

  disLikes = (meid, key,user_meid) => {
    console.log('dislike')
    let dislikes
    let dislikeList
    let post
    
     firebase.database().ref(`Posts/${meid}/${key}`).on('value',(snap)=>{ 
      console.log("data", snap.val());
      dislikes = snap.val().dislikes
      dislikeList = snap.val().dislikeList
  }); 

  if ( dislikeList.indexOf(user_meid) !== -1){
    dislikes = dislikes - 1
    let index = dislikeList.indexOf(user_meid)
    dislikeList.splice(index,1)
    post = {
      dislikeList: dislikeList,
      dislikes: dislikes
    }
  }else {
    dislikes = dislikes + 1
    dislikeList.push(user_meid)
    post = {
      dislikeList: dislikeList,
      dislikes: dislikes
    }
  }

  
    firebase.database().ref(`Posts/${meid}/${key}`).update(post)
    
  }

  addComment = (evt,meid,key) => {
    evt.preventDefault()
    let commentsList
    let post
    const le = 10;
    let cid = randomId(le, pattern)

    firebase.database().ref(`Posts/${meid}/${key}`).on('value',(snap)=>{ 
      commentsList = snap.val().commentsList
    });

    if (evt.keyCode === 13){

     
    if (commentsList === undefined) {
      commentsList = []
      
      cid = {
        comment:evt.target.textContent,
        pics: this.state.user.pics,
        name: this.state.user.fullname,
        time: Date.now()
      }

      commentsList.push(cid)
      post = {
        commentsList: commentsList
      }
      
    } else {
      cid = {
        comment:evt.target.textContent,
        pics: this.state.user.pics,
        name: this.state.user.fullname,
        time: Date.now()
      }

      commentsList.push(cid)
      post = {
        commentsList: commentsList
      }
    }

    evt.target.innerText = ''

    firebase.database().ref(`Posts/${meid}/${key}`).update(post)

    }

    
  }

  videocount = (video,meid,key) => {
    let view;
    let post;
    video.addEventListener('ended', function(e) {
      console.log('ended')
      // Your code goes here
      firebase.database().ref(`Posts/${meid}/${key}`).on('value',(snap)=>{ 
          console.log("data", snap.val());
          view = snap.val().view
          
      }); 

      view = view + 1
      post = {
        view:view
      }

      firebase.database().ref(`Posts/${meid}/${key}`).update(post)

  });
  }



  render() {
    const { me, logState, allposts, user, progress, user_meid, userSettings } = this.state;
    
  

    return (
     <div>
       <NavBar onSubmit={this.SignOut()} user={user} logState={logState} me={me}/>
       <Switch>

          <Route exact path="/" render={ ({history}) => ( <CinemaList vc={this.videocount} me={me} addComment={this.addComment} user_meid={user_meid} disLikes={this.disLikes} addLikes={this.addLikes} logState={logState} history={history} data={allposts}   / > )}  />


          <Route path="/login" render={
            ({ history}) => (
              <Login err={this.state.err}  submitting={this.state.submitting} onSubmit={this.handleSignIn(history)}/>
            )
          } 
          />

           <Route path="/register" render={
            ({ history}) => (
              <Register err={this.state.err} submitting={this.state.submitting} onSubmit={this.handleSignUp(history)}/>
            )
          } 
          />

          <Route exact path="/discover" render={ ({history}) => ( <DiscoverList logState={logState} me={me} history={history} data={allposts} vc={this.videocount}  addComment={this.addComment} user_meid={user_meid} disLikes={this.disLikes} addLikes={this.addLikes}  / > )}  />
          <Route exact path="/review" render={ ({history}) => ( <ReviewList vc={this.videocount} me={me} addComment={this.addComment} user_meid={user_meid} disLikes={this.disLikes} addLikes={this.addLikes} logState={logState} history={history} data={allposts}   / > )}  />
          <Route exact path="/notification" render={ ({history}) => ( <Notification logState={logState} me={me} history={history}  / > )}  />
          
          <Route exact path="/add1" render={ 
            (
              
           {history}) => ( 
           <ProtectedAdd1 logState={logState} progress={progress} me={me} history={history} addDate1={this.AddData1} role={userSettings.role}  / > )}  />
          

          <Route exact path="/add" render={ ({history}) => ( <Add logState={logState} progress={progress} me={me} history={history} addDate={this.AddData} userSettings={userSettings}  / > )}  />
       </Switch>
     </div>
    );
  }
}

export default App;
