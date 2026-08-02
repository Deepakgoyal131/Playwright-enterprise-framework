**Responsibility of Click Helper**
Click Request

↓

Wait Visible

↓

Wait Enabled

↓

Scroll Into View

↓

Click

↓

Success Log

↓

Failure → ErrorHandler

**Why does locator.click() fail?**
Playwright is already smart, but real-world applications introduce additional challenges:
| Problem                  | Example                                 |
| ------------------------ | --------------------------------------- |
| Element not visible      | Loading animation still running         |
| Element disabled         | Button enabled after API response       |
| Overlay blocking click   | Modal backdrop or spinner               |
| Element outside viewport | Long pages                              |
| React re-render          | DOM recreated just before click         |
| Animation                | CSS transition in progress              |
| Slow application         | Element becomes clickable after a delay |

**Public API**
await ClickHelper.click(locator);