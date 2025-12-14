# NoCulture OS - Intelligence Center

AI-powered analytics dashboard for music creators, providing insights into fan engagement, post performance, and growth metrics with a terminal-style interface.

## Features

- **Dashboard**: Overview of key metrics and performance indicators
- **Fans Analytics**: Detailed insights into your audience demographics and behavior
- **Posts Analytics**: Track performance of your social media posts
- **AI Assistant**: Get intelligent insights and recommendations
- **Terminal UI**: Cyberpunk-inspired interface with neon green accents

## Getting Started

1. Ensure you have the latest version of Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_RECOUP_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Components

- `DashboardView`: Main overview with key metrics
- `FansView`: Fan analytics and demographics
- `PostsView`: Social media post performance
- `AssistantView`: AI-powered insights and recommendations
- `SummaryPanel`: Quick stats and top performing content
- `ApiKeyInput`: Secure API key management

## Styling

The Intelligence Center uses a custom CSS file for terminal-style UI elements. Key styles include:

- Neon green color scheme with dark backgrounds
- Terminal-like scrollbars and inputs
- Glow effects on interactive elements
- Responsive design for all screen sizes

## API Integration

The Intelligence Center integrates with the Recoup API to fetch real-time analytics data. Ensure you have a valid API key with the following scopes:

- `analytics:read`
- `fans:read`
- `posts:read`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
