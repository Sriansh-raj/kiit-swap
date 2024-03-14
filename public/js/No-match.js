// Define an array of strings to be displayed and erased
const textArray1 = [
    "No matching result found !! Wait for others to signup"  
    // Add more strings as needed
  ];
  
  // Initialize variables
  let typeJsText1 = document.querySelector(".No-match");
  let stringIndex1 = 0; // Index of the current string in the array
  let charIndex1 = 0; // Index of the current character in the current string
  let isTyping1 = true; // Whether we are currently typing or erasing
  
  function typeJs1() {
    if (stringIndex1 < textArray1.length) {
      // Check if there are more strings to display or erase
      const currentString1 = textArray1[stringIndex1];
  
      if (isTyping1) {
        // Typing animation
        if (charIndex1 < currentString1.length) {
          typeJsText1.innerHTML += currentString1.charAt(charIndex1);
          charIndex1++;
        } else {
          isTyping1 = false; // Switch to erasing mode
        }
      } else {
        // Erasing animation
        if (charIndex1 > 0) {
          typeJsText1.innerHTML = currentString1.substring(0, charIndex1 - 1);
          charIndex1--;
        } else {
          isTyping1 = true; // Switch back to typing mode
          stringIndex1++; // Move to the next string
  
          if (stringIndex1 >= textArray1.length) {
            stringIndex1 = 0; // Reset to the beginning of the array
          }
  
          charIndex1 = 0; // Reset character index
          typeJsText1.innerHTML = ""; // Clear the content for the new string
        }
      }
    }
  }
  
  // Set an interval to call the typeJs function
  setInterval(typeJs1, 100); // You can adjust the animation speed as needed
  