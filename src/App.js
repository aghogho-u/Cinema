import React, { Component } from 'react';
import './App.css';
import {Switch,Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js/';
import CinemaList from './components/CinemaList';
import Discover from './components/Discover';
import Review from './components/Review';
import Notification from './components/Notification';
import Add from './components/Add';
import Add1 from './components/Add1';
import Register from './components/Register';
import Login from './components/Login';
import {base, firebase, fireAuth} from "./config/fire";
const randomId = require('random-id');

const leng = 30;
 
// pattern to determin how the id will be generated
// default is aA0 it has a chance for lowercased capitals and numbers
const pattern = 'aA0'
 



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
      progress: 0
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
  

    }  
  });

  firebase.database().ref('Posts').on('value',(snap)=>{ 
      console.log("data", snap.val());
      let allposts = snap.val()
      console.log("check", snap.val())
      localStorage.setItem('allposts', JSON.stringify(allposts));
      this.setState({allposts})
  });

  

    
}

  

  handleSignIn = history => (email, password) => {
    this.setState({submitting:true})
    return fireAuth.signInWithEmailAndPassword(email, password).then(() => {
      this.setState({logState:true })
      return history.push("/add");
      
    },
    err => {
      this.setState({submitting:false})
      this.setState({err: true})
      console.log("error", err)
    }
    
    );

  };
  
  handleSignUp = history => (email, password) => {
    return fireAuth.createUserWithEmailAndPassword(email, password).then(() => {
      return history.push("/");
    });
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
    console.log(pics)

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

  AddData1 = (evt, history) => {
    let that = this;
    evt.preventDefault();
    console.log("collected")
    let video = document.getElementById("myFile").files[0];
    let caption = document.getElementById("caption").value;
    let title = document.getElementById("title").value;
    let view = document.getElementById("view").value;
    let comments = null;
    let likes = null;
    let dislikes = null;
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
    const post = {
      video:downloadURL,
      caption,
      title,
      view,
      comments,
      likes,
      dislikes,
      email: JSON.parse(localStorage.getItem('me')).email,
      key:id,
      postt:posttime,
      pics: that.state.user.pics,
      fullname: that.state.user.fullname,
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


  render() {
    const { me, logState, allposts, user, progress } = this.state;
  

    return (
     <div>
       <NavBar onSubmit={this.SignOut()} user={user} logState={logState} me={me}/>
       <Switch>

          <Route exact path="/" render={ ({history}) => ( <CinemaList logState={logState} me={me} history={history} data={allposts}   / > )}  />

          <Route path="/login" render={
            ({ history}) => (
              <Login err={this.state.err} submitting={this.state.submitting} onSubmit={this.handleSignIn(history)}/>
            )
          } 
          />

           <Route path="/register" render={
            ({ history}) => (
              <Register onSubmit={this.handleSignUp(history)}/>
            )
          } 
          />

          <Route exact path="/discover" render={ ({history}) => ( <Discover logState={logState} me={me} history={history}  / > )}  />
          <Route exact path="/review" render={ ({history}) => ( <Review logState={logState} me={me} history={history}  / > )}  />
          <Route exact path="/notification" render={ ({history}) => ( <Notification logState={logState} me={me} history={history}  / > )}  />
          <Route exact path="/add" render={ ({history}) => ( <Add logState={logState} progress={progress} me={me} history={history} addDate={this.AddData}  / > )}  />
          <Route exact path="/add1" render={ ({history}) => ( <Add1 logState={logState} progress={progress} me={me} history={history} addDate1={this.AddData1}  / > )}  />
          
       </Switch>
     </div>
    );
  }
}

export default App;
