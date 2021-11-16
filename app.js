import { LessJs } from './lessJs/less.js'
const test = document.getElementById('test')

const Test = new LessJs() ; Test.run('#testImg')

test.addEventListener('click',()=>{
    // let newTitle = document.querySelector('#newTitle').value
    // Head.update('title',newTitle)
    console.log(Test.data)
    Test.update('profileImage','/bag2.jpeg')
    Test.update('homeUrl','/home2')
})
