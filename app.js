import LessJs from './modules/LessJs_0.0.3.js'

const less = LessJs ; less.run('#app')

// register functions to LessJS
less.changeProfileImage = changeProfileImage

// create function
function changeProfileImage(e){
    // change user image
    less.update('userImage','/images/fakeUser2.jpeg')
}
