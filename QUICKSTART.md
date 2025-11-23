# Quick Start Guide - CodeQuality

## 🎯 What You've Built

A professional AI-powered code analysis platform with 3 core features:
- **Code Explainer**: Line-by-line code explanations
- **Bug Finder**: Detect bugs with severity levels and fixes
- **Code Refactoring**: Get improvement suggestions

## 🚀 Running Locally

The development server is now running at: **http://localhost:5174/**

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📱 How to Use

1. **Open** http://localhost:5174/ in your browser
2. **Select** analysis type from dropdown (Code Explainer, Bug Finder, or Refactoring)
3. **Choose** your programming language
4. **Paste** your code in the left panel
5. **Click** "Analyze Code" button
6. **View** results in the right panel

## 🎨 UI Features

- Clean white background with excellent readability
- Professional GitHub Copilot-style interface
- Split-pane layout for code and results
- Feature selector combobox
- Language selector (10+ languages)
- Loading animations
- Responsive design

## 🔄 Sample Code to Test

### JavaScript Example:
```javascript
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}
```

### Python Example:
```python
def find_max(numbers):
    max_num = numbers[0]
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num
```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Deploy automatically

## 📦 Project Structure

```
CodeQuality/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── select.tsx
│   │   ├── features/        # Feature components
│   │   │   ├── CodeExplainer.tsx
│   │   │   ├── BugFinder.tsx
│   │   │   └── RefactoringSuggester.tsx
│   │   └── CodeEditor.tsx   # Monaco editor wrapper
│   ├── services/
│   │   └── api.ts          # Mock API with sample data
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html             # HTML template
└── package.json           # Dependencies
```

## 🔧 Next Steps

### For AI Integration (Real API):
Replace mock data in `src/services/api.ts` with actual API calls:
- OpenAI API
- Anthropic Claude
- Azure OpenAI
- Or your custom AI endpoint

### Environment Variables:
Create `.env` file:
```
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_URL=your_api_url_here
```

## 📚 Features Breakdown

### Code Explainer
- Splits code into lines
- Provides "What it does" explanation
- Provides "Why it's needed" context
- Flags potential issues

### Bug Finder
- Categorizes by severity (Critical, High, Medium, Low)
- Shows bug count dashboard
- Provides detailed explanations
- Suggests concrete fixes
- Filterable by severity

### Code Refactoring
- Shows overall quality score
- Lists improvement suggestions
- Shows priority (High, Medium, Low)
- Before/after code comparison
- Lists benefits for each suggestion

## 🎨 Customization

### Colors:
Edit `src/index.css` for theme colors

### Languages:
Add more in `src/types/index.ts` → `SUPPORTED_LANGUAGES`

### Features:
Add more in `src/types/index.ts` → `FEATURES`

## 💡 Tips

- Use the Monaco editor's built-in features (Ctrl+F for find, etc.)
- Click severity badges in Bug Finder to filter
- Expand refactoring suggestions for detailed before/after comparison
- Clear button resets both code and results

## 🐛 Troubleshooting

### Port already in use:
Vite will automatically use the next available port (5174, 5175, etc.)

### Build errors:
Run `npm run build` to check for TypeScript errors

### Missing dependencies:
Run `npm install` to reinstall all packages

## 📖 Documentation

- Full Product Spec: `PRODUCT_SPEC.md`
- README: `README.md`
- This Guide: `QUICKSTART.md`

---

**Ready to go!** Open http://localhost:5174/ and start analyzing code! 🚀
