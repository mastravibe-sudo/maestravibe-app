# 🔑 How to Get Anthropic API Key

## Step-by-Step Guide

### Step 1: Open Anthropic Console
Go to: https://console.anthropic.com/

You'll see the login page.

### Step 2: Create Account
- Click "Sign up" (if new user)
- Enter email
- Create password
- Verify email

Or if you have account:
- Click "Sign in"
- Enter email & password

### Step 3: Go to API Keys
After login:
1. Look for menu on left side
2. Click on **"API Keys"** section
3. You'll see a button that says "Create Key"

### Step 4: Create New API Key
1. Click **"Create Key"** button
2. Optional: Give it a name like "MaestraVibe Production"
3. Click **"Create"**

### Step 5: Copy Your Key
You'll see your API key displayed:
```
sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT:** Copy this immediately! You won't see it again.

### Step 6: Add to Your Project

Open file: `d:\maestravibe.pk\maestravibe-app\.env.local`

Add this line:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

Replace `sk-ant-xxxxxxxxxxxxxxxxxxxxx` with your actual key.

### Step 7: Restart Server
In terminal:
```bash
npm run dev
```

✅ **Done!**

---

## 🆓 Free Tier Information

### What You Get
- Free trial credits (usually $5)
- Test API fully
- No payment needed initially

### When You Need Paid Plan
- After free credits end
- For production use
- High traffic websites

### Pricing
- Pay as you go
- ~$3 per 1 million tokens
- Each chat: 100-500 tokens (~$0.0005)

---

## 🔒 Safety Tips

✅ **DO:**
- Keep API key secret
- Never share it publicly
- Add to `.env.local` only
- Rotate keys regularly

❌ **DON'T:**
- Put in public GitHub
- Share in code comments
- Send in emails
- Hard-code in app

---

## 🆘 If You Lost Your Key

1. Go to https://console.anthropic.com/
2. Go to "API Keys"
3. Find your key in the list
4. Click to regenerate it
5. Copy the new key
6. Update `.env.local`

---

## 📊 Monitor Usage

To see your API usage:
1. Go to https://console.anthropic.com/
2. Click "Usage" tab
3. See:
   - Total tokens used
   - Cost so far
   - Usage graph
4. Set spending limits if needed

---

## ✅ Verify It Works

After adding API key:

1. Restart server: `npm run dev`
2. Open your website
3. Click 🤖 chat button
4. Type: "Assalam o Alaikum"
5. AI should respond!

If it doesn't work:
- Check `.env.local` is correct
- Make sure key starts with `sk-ant-`
- Restart server again
- Check browser console for errors (F12)

---

## 🎯 Common Issues

### "API key not configured"
**Fix:** 
- Make sure `.env.local` has `ANTHROPIC_API_KEY`
- Restart: `npm run dev`
- Don't put quotes around key

### "Invalid API key"
**Fix:**
- Double-check copy-paste
- No extra spaces
- Starts with `sk-ant-`
- Regenerate new key from console

### "Rate limit exceeded"
**Fix:**
- You've used too many tokens
- Upgrade to paid plan
- Or wait until tomorrow

---

## 📞 Anthropic Support

- Website: https://www.anthropic.com/
- Help: https://support.anthropic.com/
- Docs: https://docs.anthropic.com/

---

## 🎉 Ready!

Once API key is added:
✅ Chat works
✅ Voice works
✅ AI knows products
✅ Customers can use it!

**Questions?** Check `AI_CHAT_QUICK_START.md`

---

Made for MaestraVibe
2026-06-17
