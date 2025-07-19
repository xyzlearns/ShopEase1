# ShopEase Deployment Guide

## Vercel Deployment

### 1. Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Environment variables ready

### 2. Environment Variables
Set these in your Vercel project settings:

```bash
DATABASE_URL=your_neon_database_url
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key_with_newlines
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
JWT_SECRET=your_random_jwt_secret
NODE_ENV=production
```

### 3. Deploy Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure build settings:
   - Build Command: `node build-vercel.js`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
4. Add environment variables
5. Deploy

### 4. Custom Domain (Optional)
- Add your custom domain in Vercel project settings
- Update DNS records as instructed

---

## Render Deployment

### 1. Prerequisites
- Render account
- GitHub repository connected to Render

### 2. Deploy from Dashboard
1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will use the `render.yaml` configuration

### 3. Environment Variables
Set these in your Render service settings:
```bash
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key_with_newlines
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
JWT_SECRET=your_random_jwt_secret
```

### 4. Database Setup
- Render will automatically create a PostgreSQL database
- DATABASE_URL will be automatically connected

---

## Manual Deployment Steps

### 1. Prepare Environment
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Build the application
cd frontend && npm run build
cd ../backend && npm run build
```

### 2. Database Migration
```bash
# Push database schema
npm run db:push
```

### 3. Start Production Server
```bash
cd backend && npm start
```

---

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `GOOGLE_CLIENT_EMAIL` | Service account email | `service@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_SHEET_ID` | Google Sheets spreadsheet ID | `1r_lJ1xERb8aLOViEG9nauq0ZK2zRp1566F2LQBbplpk` |
| `GOOGLE_DRIVE_FOLDER_ID` | Google Drive folder ID | `1DtptDo0Q2CIrNdd_hlLf2nFNhNXG5s9w` |
| `JWT_SECRET` | Random secret for JWT tokens | `your-super-secret-key` |

---

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are listed in package.json
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify DATABASE_URL format
4. **Google API Issues**: Check service account permissions

### Logs
- **Vercel**: Check function logs in Vercel dashboard
- **Render**: View logs in Render service dashboard

### Health Check
Visit `/api/products` to test if the API is working correctly.

---

## Performance Notes

- **Static Assets**: Served from CDN automatically
- **API Functions**: Optimized for serverless execution
- **Database**: Connection pooling enabled
- **File Uploads**: Stored in public/uploads directory