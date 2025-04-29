# TikTok Framework & Script Generator

A minimal, modern web application that generates authentic TikTok content approaches and scripts using AI. Simply enter a topic and choose your language to get a natural, relatable content plan for your next TikTok video.

## Features

- Clean, modern user interface with smooth transitions
- API key management via local storage
- English and Bahasa Malaysia language support
- Copy-to-clipboard functionality
- Responsive design for mobile and desktop
- Secure API key storage

## Setup & Deployment

### Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. Enter your OpenRouter API key when prompted

### GitHub Pages Deployment

1. Create a GitHub repository
2. Upload all files to the repository
3. Go to **Settings** > **Pages**
4. Select the branch containing your code (usually `main`)
5. Set the folder to `/ (root)`
6. Click **Save**
7. Your site will be published at `https://[your-username].github.io/[repository-name]/`

## API Key Management

- On first visit, you'll be prompted to enter your OpenRouter API key
- The key is stored securely in your browser's localStorage
- You can change your API key anytime by clicking the gear icon (⚙️) in the header
- Your API key is never sent to any server except OpenRouter for content generation

## Design Choices

### UI/UX

- **Color Palette**: Soft purples and blues with ample white space for a clean, professional look
- **Typography**: System fonts for optimal performance and native feel
- **Card-based Layout**: Clean separation of input and output sections
- **Loading States**: Transparent overlay with spinner for clear feedback during API calls
- **Responsive Design**: Mobile-first approach with adjustments for larger screens

### Technical

- **Vanilla JavaScript**: No frameworks for maximum performance and simplicity
- **LocalStorage**: For secure client-side storage of the API key
- **Fetch API**: For modern, Promise-based network requests
- **CSS Custom Properties**: For consistent theming and easy customization
- **Event Delegation**: For efficient event handling

## Content Approach

The generator creates authentic, non-promotional TikTok content with:

1. **Content Approach**: Thoughtful, relatable ways to present the topic
2. **Narrative Flow**: Natural progression of the video
3. **Talking Points**: Conversational key ideas to mention
4. **Visuals**: Subtle visual elements that enhance without overwhelming
5. **Authentic Hooks**: Natural ways to capture interest
6. **Gentle Invitation**: Soft call-to-action that feels like a genuine suggestion

## Usage Tips

1. Be specific with your topic for better results
2. The generated content is designed to feel authentic and conversational
3. Use the framework as inspiration rather than a rigid structure

## Credits

Built with ❤️ using HTML, CSS, and JavaScript. 