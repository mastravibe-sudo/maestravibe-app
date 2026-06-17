# 🤖 AI Chat - Quick Start Guide

## ⚡ 60-Second Setup

### Step 1: Get Free API Key (2 min)
1. Go to https://console.anthropic.com/
2. Sign up (free account)
3. Go to "API Keys" section
4. Create new key
5. Copy the key

### Step 2: Add to Your Project (1 min)
Open `.env.local` and add:
```env
ANTHROPIC_API_KEY=sk-ant-xxx...paste...your...key...here...xxx
```

### Step 3: Restart Server (1 min)
```bash
npm run dev
```

That's it! 🎉

---

## 🧪 Test It

1. **Open your website** in browser
2. **Look for 🤖 chat button** (bottom right)
3. **Click it** - chat window opens
4. **Type:** "Show me gym equipment"
5. **AI responds:** with smart suggestions!

### Optional: Try Voice 🎤
- Click **microphone button** (amber icon)
- Speak in Urdu or English
- It converts to text automatically!

---

## 🎯 What It Does

When customer uses AI:

✅ **Understands all your products**
```
Knows: name, price, size, color, category, description
```

✅ **Asks smart clarifying questions**
```
Customer: "Show me something for home workout"
AI: "Dumbbells, yoga mat, or resistance bands?"
```

✅ **Suggests relevant products**
```
Shows 3-4 best matching products with:
- Product image
- Price in Rs.
- One-click view details
```

✅ **Stores chat locally**
```
Chat saved ONLY on customer's device
- No server tracking
- No personal data collected
- Customer can clear anytime
```

---

## 🚀 Features

### For Customers
🎤 **Voice Input** - Speak instead of typing
🔊 **Voice Output** - AI speaks responses back
💬 **Smart Suggestions** - Gets product recommendations
📱 **Mobile Friendly** - Works on phones & tablets
💾 **Private Chats** - History saved locally only

### For You
📊 **AI Powered** - Uses Claude AI (best AI)
🛍️ **Product Aware** - Knows all your products
⚡ **Fast** - Responds in 1-3 seconds
🔒 **Secure** - No customer data stored
📈 **Scalable** - Handles many users

---

## 📝 How Customers Experience It

### Scenario 1: Voice Chat
```
Customer clicks 🤖
↓
Clicks 🎤 (microphone)
↓
"Hi Maeatra, show me dumbbells"
↓
AI responds with suggestions
↓
Customer clicks product to buy
✅ Done!
```

### Scenario 2: Text + Product Click
```
Customer types: "Women's kurta"
↓
AI asks: "What style? Casual or formal?"
↓
Customer: "Casual"
↓
AI suggests 3-4 products
↓
Customer clicks → Product page
✅ Converted!
```

---

## 🔧 Configuration

### Change AI Language
Edit `lib/voice-utils.ts`:
```typescript
// Change from Urdu to English
language: 'en-US', // English
// language: 'ar-SA', // Arabic
// language: 'fr-FR', // French
```

### Customize Greeting
Edit `components/AIChat.tsx`:
```typescript
content: 'Your custom greeting here! 👋',
```

### Change Button Color
Edit `components/AIChat.tsx`:
```typescript
// Change rose-600 to your brand color
className="bg-rose-600"
```

---

## 💰 Cost Estimate

| Usage | Cost |
|-------|------|
| 1 message | $0.0005 |
| 100 chats/day | ~$5/month |
| 1000 chats/day | ~$50/month |

**Free Tier:** Some free credits included with new account

---

## 📁 What Was Added

### Files Created:
- `app/api/ai-chat/route.ts` - AI backend
- `components/AIChat.tsx` - Chat UI (rewritten)
- `lib/chat-storage.ts` - Local storage
- `lib/voice-utils.ts` - Voice/speech
- `AI_CHAT_SETUP.md` - Full documentation

### Files Updated:
- `.env.local` - Added API key placeholder
- `AIChat.tsx` - Completely redesigned

---

## ✅ Checklist

- [ ] Get Anthropic API key
- [ ] Add to `.env.local`
- [ ] Restart: `npm run dev`
- [ ] Visit website
- [ ] Click 🤖 chat button
- [ ] Test with message
- [ ] Test voice (click 🎤)
- [ ] Try product suggestions
- [ ] Test on mobile

---

## 🆘 Troubleshooting

### Chat says "API key not configured"
✅ **Fix:** Add `ANTHROPIC_API_KEY=sk-ant-xxx` to `.env.local`

### Voice button not appearing
✅ **Fix:** Refresh page, check browser supports Web Speech API

### No product suggestions showing
✅ **Fix:** Check products are in database with correct data

### Response is slow
✅ **Normal:** First response takes 1-3 seconds
✅ **Check:** Internet connection speed

---

## 🎁 Bonus Features

### Clear Chat History
- Click ⚙️ settings in chat header
- Click "Clear History"
- All local chats deleted

### New Chat Session
- Click ⚙️ settings
- Click "New Chat"
- Starts fresh conversation

### Export Chat
- Developer can call: `exportChatHistory()`
- Returns JSON of all chats
- For backup/analysis

---

## 🚀 Next: Deploy to Production

When ready to go live:

1. Get production API key (different tier)
2. Update `.env.local`
3. Run: `npm run build`
4. Deploy to Vercel/Netlify
5. Monitor API usage
6. Adjust API tier if needed

---

## 📞 Support

**Issue with setup?**
- Check `AI_CHAT_SETUP.md` for detailed guide
- Check browser console for errors (F12)
- Verify API key is correct
- Restart server

**Want to customize?**
- Edit system prompt in `app/api/ai-chat/route.ts`
- Change colors in `components/AIChat.tsx`
- Adjust voice in `lib/voice-utils.ts`

---

## 🎉 You're Live!

Your AI shopping assistant is now ready for customers!

**Start server:**
```bash
npm run dev
```

**Visit your site and test!** 🤖

---

Made for MaestraVibe with ❤️
Last updated: 2026-06-17
