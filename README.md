SLIDE editor webapp
======

Experimental web app to preview and edit Geometry Stash slide files. This web app was used to rapidly prototype and preview changes to the default geometry math slides included in the [Geometry Stash app for iOS](https://itunes.apple.com/us/app/geometry-stash/id324651852?mt=8). Most of the custom JS I wrote is in `js/draw.js`. 

#### Notable features:
- Canvas text wrapping implemented in `wrapText(context, text, x, y, maxWidth, lineHeight)`. 

You are free the download the source use whatever is useful in your own projects. The source is under MIT License. If you do make changes, pull requests will be accepted. I am no longer actively working on this project so there is no support provided for this web app. 

Usage
------

[Use it HERE](http://ansonl.github.io/geometry-stash-web-slide-editor)

![Sample File loaded](https://raw.githubusercontent.com/ansonl/geometry-stash-web-slide-editor/gh-pages/screenshots/sample-file.png)

The interface has three panes
  * Tree structure view on the left 
  * Canvas preview in the upper right
  * Textarea view in the lower right

1. Paste slide file code into the textarea in the lower right. The editor will update the canvas and tree structure view on the left. 
2. Edit the tree structure view OR the textarea. The canvas preview and other untouched input panes will be updated. If your edit is not proper JSON, the JS update loop will stop executing. **The preview and input panes will not update to reflect any changes afterwards until the ellipse element is removed.** I recommend you keeping the browser JS console open to monitor for errors. 
3 (optional) Press *Refresh* button in the top menu bar to manually update all three panes with the contents of the master internal dictionary/map that the web app has been updating. **The master dictionary holds the contents of the last edit that is valid JSON. ** If you are not monitoring for errors in console, this is your best way of confirming that input is valid or not!

  * To use the *MOVE arrow buttons*, you must enter an offset in the *Move by text box* in the top menu bar. 

Known issues
------
Setting Text element text key value to a number will cause invalid JSON due to code treating the number as not a string. Workaround is to edit the value directly in the textarea pane. 

Safari does **not** support the HTML canvas [ellipse](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element and the JS update loop will stop executing when an ellipse element is inputted. **The preview and input panes will not update to reflect any changes afterwards until the ellipse element is removed.** This app was developed and tested on Google Chrome so **please use Chrome** with this. 
