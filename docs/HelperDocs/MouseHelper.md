**🎯 Responsibilities of MouseHelper**

Our helper should support:

1. Hover
2. Double Click
3. Right Click
4. Drag and Drop
5. Mouse Move
6. Mouse Down
7. Mouse Up
8. Mouse Wheel (Scroll)
9. Click at Position (future)

**Public API**

- Our API should look like this:

await MouseHelper.hover(locator);

await MouseHelper.doubleClick(locator);

await MouseHelper.rightClick(locator);

await MouseHelper.dragAndDrop(source, target);

await MouseHelper.move(page, 500, 300);

await MouseHelper.mouseDown(page);

await MouseHelper.mouseUp(page);

await MouseHelper.mouseWheel(page, 0, 1000);