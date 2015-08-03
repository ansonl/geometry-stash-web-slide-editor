SLIDE editor webapp
======

Experimental web app to preview and edit Geometry Stash slide files. 

Usage
------
The interface has three panes
  * Tree structure view on the left 
  * Canvas preview in the upper right
  * Textarea view in the lower right

1. Paste slide file code into the textarea in the lower right. The editor will update the canvas and tree structure view on the left. 
2. Edit the tree structure view OR the textarea. The canvas preview and other untouched input panes will be updated. If your edit is not proper JSON, the JS update loop will stop executing. **The preview and input panes will not update to reflect any changes afterwards until the ellipse element is removed.** I recommend you keeping the browser JS console open to monitor for errors. 
3 (optional) Press *Refresh* button in the upper left to manually update all three panes with the contents of the master internal dictionary/map that the web app has been updating. **The master dictionary holds the contents of the last edit that is valid JSON. ** If you are not monitoring for errors in console, this is your best way of confirming that input is valid or not!

Known issues
------
Setting Text element text key value to a number will cause invalid JSON due to code treating the number as not a string. Workaround is to edit the value directly in the textarea pane. 

Safari does not support the HTML canvas [ellipse](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element and the JS update loop will stop executing when an ellipse element is inputted. **The preview and input panes will not update to reflect any changes afterwards until the ellipse element is removed.**