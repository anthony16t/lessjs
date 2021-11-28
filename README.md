### Start module by importing LessJs
``` javascript
import LessJs from './modules/LessJs_0.0.3.js'
const less = LessJs()
```
### Run run LessJs
This will run on element with id app
``` javascript
// 
less.run('#app')
```
If Data was passed on .run(Data) it will replace any variable value with given data
This will replace any less="title:" on app element
``` javascript
const Data = { title:'LessJs | Write less javascript' }
// Replace any less tag value with title key
less.run('#app',Data)
```
### Set less variables in html file
Setting siteTitle on a element with innerText will take that value and assign it to siteTitle,
If siteTitle was not passed on Data object when running .run() function
Taking siteTitle from main nav logo will take LessJs as siteTitle
``` html
<h2 class="logo" less="siteTitle:">LessJs</h2>
```
### Using same siteTitle variable on other element
Here siteTitle will use previously assigned data LessJs for this input
Note that if this input change value it will update any siteTitle in your #app
In this case it will change logo title if input change
``` html
<div class="label">
    <label for="changeSiteName">Site title</label>
    <input type="text" id="changeSiteName" less="siteTitle:">
</div>
```
### Updating values
If the element is a input or textarea it will update all element with the same name
when there is a key up on them.
if using other element tags like p,h2,img or other you will need to update it manually
#### Update element value
We can do this by adding a function to the element named: changeProfileImage or whatever you want.
#### Adding function to element
add (register) and create changeProfileImage function to LessJs
Add less-on tag to element less-on="click:changeProfileImage"
This will add a click event to element and run changeProfileImage when clicked
``` html
```
``` javascript
// register functions to LessJS
less.changeProfileImage = changeProfileImage

// create function
function changeProfileImage(){
    // change user image
}
```
### Profile image
Just add less tag with variable name and value (value can be empty)
less="userImage:" if it is empty like this it will take the src from img
``` html
<img less="userImage:" src="/images/fakeUser.jpeg" alt="User" class="mainNavUserImage">
```

### run changeProfileImage function
``` javascript
// use .update() it take variable name and new value
function changeProfileImage(e){
    // change user image
    less.update('userImage','/images/fakeUser2.jpeg')
}
```
