"""ScamClassifier ML pipeline: TF-IDF + Multinomial Naive Bayes trained on comprehensive cybersecurity dataset."""

import os
import re
from typing import Any, Dict, List, Optional, Tuple
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from app.core.config import settings
from app.core.logging import logger

# ~200 Realistic inline training samples across 7 threat classes
TRAINING_DATA: List[Tuple[str, str]] = [
    # 1. legitimate (30 examples)
    ("Hey are we still meeting for lunch at 1pm tomorrow?", "legitimate"),
    ("Your one-time login OTP is 482910. Valid for 5 minutes. Do not share with anyone.", "legitimate"),
    ("Your Amazon order #402-9182391 has been dispatched and will arrive by Thursday.", "legitimate"),
    ("Hi Mom, I reached home safely. Will call you after dinner.", "legitimate"),
    ("Your HDFC Bank account ending in 4102 was debited for INR 450.00 at Starbucks.", "legitimate"),
    ("Sprint planning meeting is scheduled for 10:00 AM on Google Meet.", "legitimate"),
    ("Your Uber ride receipt: INR 240 paid via Credit Card. Thanks for riding.", "legitimate"),
    ("Can you please review the attached pull request when you get a chance?", "legitimate"),
    ("Dear customer, your monthly electricity bill of Rs 1,420 is due on 25th Nov.", "legitimate"),
    ("Your flight 6E-204 from Delhi to Mumbai is on schedule. Web check-in open.", "legitimate"),
    ("Password change was successful for your GitHub account. If not you, contact support.", "legitimate"),
    ("Please find attached the quarterly financial report for your department.", "legitimate"),
    ("Your package from Swiggy Instamart is arriving in 8 minutes.", "legitimate"),
    ("Reminder: Doctor appointment tomorrow at 4:30 PM with Dr. Sharma.", "legitimate"),
    ("Good morning team, let's sync up on today's deployment checklist.", "legitimate"),
    ("Your mobile recharge of Rs 299 for Jio was successful. Data: 1.5GB/day.", "legitimate"),
    ("Here is the Wi-Fi password for the guest network: OfficeGuest2024", "legitimate"),
    ("Thanks for dining at Olive Bistro. Here is your digital invoice.", "legitimate"),
    ("Your gym subscription has been renewed for the next 3 months.", "legitimate"),
    ("School bus #12 has departed and expected arrival at stop is 3:45 PM.", "legitimate"),
    ("Your credit card statement for October is ready to download.", "legitimate"),
    ("Hi David, thanks for sending the design specs. Looks great overall.", "legitimate"),
    ("Netflix: Your membership renewed successfully for standard ultra HD.", "legitimate"),
    ("Spotify family plan invite accepted by user Alex.", "legitimate"),
    ("Your car service at Toyota service center is completed. Ready for pickup.", "legitimate"),
    ("Meeting notes from today's architecture review have been uploaded to Confluence.", "legitimate"),
    ("Your library book 'Design Patterns' is due in 3 days. Reply RENEW to extend.", "legitimate"),
    ("Please approve the expense reimbursement claim submitted on Workday.", "legitimate"),
    ("Happy birthday Sarah! Hope you have a wonderful year ahead.", "legitimate"),
    ("Your mutual fund SIP of Rs 5000 has been successfully debited.", "legitimate"),

    # 2. phishing (30 examples)
    ("Security Alert: Your PayPal account has been locked. Click here to verify identity: http://paypal-verify-auth.xyz", "phishing"),
    ("Dear user, your Microsoft 365 password expires in 2 hours. Keep current password here: http://ms-portal-update.top", "phishing"),
    ("Urgent: Unauthorized login attempt detected on your Netflix account. Confirm credentials immediately: http://netflix-auth.cam", "phishing"),
    ("Apple ID notice: Your iCloud storage is full and emails will be deleted. Update payment: http://icloud-apple-billing.work", "phishing"),
    ("Your Google workspace will be suspended within 24 hours. Verify domain now: http://google-security-action.icu", "phishing"),
    ("Wells Fargo alert: We detected unusual login from Russia. Verify card: http://wellsfargo-secure-auth.club", "phishing"),
    ("Coinbase notice: Withdrawal of 1.45 BTC initiated. If this was not you cancel here: http://coinbase-cancel-tx.site", "phishing"),
    ("Metamask security upgrade: Re-verify your 12 word secret phrase immediately or wallet will be deactivated.", "phishing"),
    ("Chase Online: Your online access has been temporarily restricted. Restore access: http://chase-unblock-portal.net", "phishing"),
    ("Facebook Security Team: Your page violates copyright policies. Appeal within 12 hours: http://meta-copyright-appeal.info", "phishing"),
    ("Steam Community: You have received a trade offer with rare items. Accept trade here: http://steamcommunity-tradeoffer.biz", "phishing"),
    ("DHL Delivery: We could not deliver your parcel due to incorrect address. Pay redelivery fee: http://dhl-parcel-trace.top", "phishing"),
    ("FedEx update: Package #US98201 held at customs. Update shipping details: http://fedex-clearance-tax.online", "phishing"),
    ("Amazon Security: Suspicious purchase of iPhone 15 Pro for $1,199. Cancel transaction here: http://amazon-dispute-order.click", "phishing"),
    ("Bank of America: Debit card suspended due to irregular activity. Enter PIN and CVV to unblock.", "phishing"),
    ("DocuSign: Important NDA document needs your urgent signature. View document: http://docusign-secure-envelope.link", "phishing"),
    ("LinkedIn Notification: 14 people searched your profile today. View their names: http://linkedin-insights-auth.xyz", "phishing"),
    ("Dropbox: 5 large files were shared with you. Log in to view: http://dropbox-shared-folder.vip", "phishing"),
    ("IRS Tax Refund: You have an unclaimed federal tax refund of $820. Submit SSN to claim.", "phishing"),
    ("UK HMRC notice: Outstanding tax balance must be settled immediately to avoid arrest warrant.", "phishing"),
    ("Twitter / X verification: Your account is scheduled for suspension. Keep your blue checkmark: http://twitter-appeal.top", "phishing"),
    ("Instagram copyright infringement: We received complaints about your posts. Verify ownership now.", "phishing"),
    ("Your Outlook mailbox has exceeded its storage quota. Click here to increase size or lose incoming emails.", "phishing"),
    ("CitiBank Fraud Alert: Card ending in 8812 was used for $450 in Dubai. Confirm at http://citi-fraud-verify.com", "phishing"),
    ("Zoom meeting invitation from HR department: Review termination list at http://zoom-recording-hr.site", "phishing"),
    ("eBay Buyer notice: Buyer requested refund for item #92831. Respond at http://ebay-dispute-center.club", "phishing"),
    ("Adobe Creative Cloud license expired. Re-enter credit card information to prevent project loss.", "phishing"),
    ("Slack security incident: Reset your enterprise password immediately: http://slack-enterprise-sso.xyz", "phishing"),
    ("Discord Nitro Free: Claim 3 months of free Discord nitro by linking your account: http://discord-gift-claim.top", "phishing"),
    ("Binance Security Alert: New API key generated from unknown device. Revoke here: http://binance-api-revoke.org", "phishing"),

    # 3. financial_scam (30 examples)
    ("SBI Notice: Your savings account has been frozen due to expired PAN card. Update PAN immediately via http://sbi-pan-update.top", "financial_scam"),
    ("Dear customer, your ICICI bank account will be closed today. Click here to update mobile number and avoid closure.", "financial_scam"),
    ("Axis Bank alert: Rs 48,000 debited from your card. If not done by you, immediately call helpline 9876543210 to stop.", "financial_scam"),
    ("Punjab National Bank: Dear user your net banking service is blocked. Submit details at http://pnb-unblock.xyz", "financial_scam"),
    ("Kotak Mahindra: Immediate KYC verification required to prevent credit card deactivation. Submit KYC online.", "financial_scam"),
    ("Bank of Baroda: Pre-approved personal loan of Rs 10,00,000 at zero interest. Click to disburse loan immediately.", "financial_scam"),
    ("Your electricity bill was not updated and power supply will be disconnected tonight at 9:30 PM. Call electricity officer.", "financial_scam"),
    ("Credit score dropped below 500. Fix your CIBIL score instantly for Rs 999. Contact financial advisor.", "financial_scam"),
    ("Investment Opportunity: Guaranteed 200% return in 7 days with algorithmic cryptocurrency trading. Deposit Rs 10000.", "financial_scam"),
    ("Double your money in 24 hours with our government approved doubling scheme. Send funds to agent.", "financial_scam"),
    ("Exclusive stock tips with 100% accuracy. Join WhatsApp VIP trading group for guaranteed daily profits of 50k.", "financial_scam"),
    ("Forex trading robot generates $500 daily passive income while you sleep. Transfer initial license fee.", "financial_scam"),
    ("Dear HDFC user, credit card reward points worth Rs 9,850 are expiring tonight. Redeem into cash directly: http://hdfc-rewards.club", "financial_scam"),
    ("Canara Bank customer: Your debit card is deactivated. Send OTP received on phone to restore.", "financial_scam"),
    ("Union Bank: Update your Aadhaar card with bank account within 2 hours or penalty of Rs 5000 will be levied.", "financial_scam"),
    ("Immediate loan approved without income proof or CIBIL check. Pay processing fee of Rs 2500 to release loan amount.", "financial_scam"),
    ("Your pending tax refund of Rs 18,450 has been approved. Provide bank account and CVV number to deposit.", "financial_scam"),
    ("IndusInd alert: Card transaction of Rs 64,200 pending approval. Call customer care 8887776665 immediately to cancel.", "financial_scam"),
    ("Central Bank: Urgent notice, your account has been placed under surveillance. Verify debit card credentials.", "financial_scam"),
    ("VIP Bitcoin investment pool: Invest 0.05 BTC and receive 0.25 BTC every week. Send crypto to wallet address.", "financial_scam"),
    ("Federal Bank notice: Netbanking profile password reset initiated. If not requested, reply with OTP to terminate.", "financial_scam"),
    ("Credit card limit increased to Rs 5,00,000 instantly without any paperwork. Click link to activate higher limit.", "financial_scam"),
    ("Your insurance policy #90128 has accrued bonus of Rs 3,45,000. Pay surrender processing tax to claim.", "financial_scam"),
    ("IDFC Bank: Claim your festive gift voucher worth Rs 5000 by verifying account credentials.", "financial_scam"),
    ("Trading account liquidated: Deposit margin call of $2000 within 1 hour to prevent total balance loss.", "financial_scam"),
    ("RBL Bank alert: Unregistered transaction detected. Click link to review debit card security settings.", "financial_scam"),
    ("Instant cash transfer of Rs 25,000 pending. Pay service charge of Rs 500 to release funds to your bank.", "financial_scam"),
    ("Your car insurance policy has expired. Pay premium now to avoid heavy police fine.", "financial_scam"),
    ("Gold loan available at 0.5% interest rate per annum. Send initial registration deposit to agent.", "financial_scam"),
    ("Yes Bank alert: Update your FATCA declaration online or foreign remittance will be confiscated.", "financial_scam"),

    # 4. upi_fraud (30 examples)
    ("Enter your UPI PIN to receive Rs 5,000 cashback from Google Pay. Offer valid for 10 minutes only.", "upi_fraud"),
    ("Congratulations! You received a payment of Rs 10,000 on PhonePe. Click here and enter UPI PIN to deposit in bank.", "upi_fraud"),
    ("OLX Buyer: I have transferred the advance of Rs 15000. Scan this QR code and type PIN to accept payment.", "upi_fraud"),
    ("PhonePe scratch card: You won Rs 3,999 cashback! Tap to open scratch card and enter your 6 digit UPI PIN.", "upi_fraud"),
    ("Paytm Refund: Your refund of Rs 2,450 is ready. Approve the collect request in your UPI app to receive money.", "upi_fraud"),
    ("GPay Reward: You have unlocked a cashback voucher worth Rs 7,500. Enter UPI PIN to credit your bank account.", "upi_fraud"),
    ("Approve UPI collect request from merchant 'RefundDesk' to receive accidental excess payment of Rs 8000.", "upi_fraud"),
    ("Scan this PhonePe merchant QR code to receive the sale price for your used sofa on Quikr.", "upi_fraud"),
    ("BHIM UPI alert: Money received request. Put your security PIN to complete incoming credit.", "upi_fraud"),
    ("Paytm customer reward: Rs 1,999 added to wallet. To transfer to bank account, input your secret UPI PIN.", "upi_fraud"),
    ("Amazon Pay balance refund of Rs 4,200. Approve collect mandate in Paytm app to credit account.", "upi_fraud"),
    ("Your UPI ID is blocked due to suspicious activity. Enter current PIN to unlock your Google Pay account.", "upi_fraud"),
    ("Army Officer on OLX: I am deployed in border area. Scan this QR code to receive money for the furniture.", "upi_fraud"),
    ("Receive Rs 2,500 instantly on WhatsApp Pay. Tap link and authorize transaction with UPI PIN.", "upi_fraud"),
    ("Cred cashback of Rs 1,200 awaiting claim. Enter debit UPI pin to push funds into your account.", "upi_fraud"),
    ("Zomato refund initiated: Delivery executive cancelled order. Open PhonePe and enter PIN to collect Rs 650.", "upi_fraud"),
    ("Uber refund: Excess fare charged. Enter UPI PIN on following link to receive Rs 350 back.", "upi_fraud"),
    ("Fake payment screenshot sent: See I have sent Rs 20000. Now enter your UPI pin to confirm receipt.", "upi_fraud"),
    ("Airtel Payments Bank: Claim Rs 500 talktime cashback by entering UPI PIN on collect notification.", "upi_fraud"),
    ("Mobikwik Supercash conversion: Convert 5000 supercash to real money by entering UPI secret pin.", "upi_fraud"),
    ("JioMart order discount: Rs 1000 cashback credited. Authorize mandate with UPI PIN to receive.", "upi_fraud"),
    ("Flipkart Pay Later refund: Approve collect request in BHIM app to credit Rs 1800 into savings bank.", "upi_fraud"),
    ("Government subsidy of Rs 2000 under PM Kisan Yojana. Enter UPI PIN to receive into Aadhaar linked bank.", "upi_fraud"),
    ("Electricity bill double payment refund: Enter UPI PIN to get duplicate transaction reversed.", "upi_fraud"),
    ("Fastag recharge failed: Enter UPI PIN on verification link to get Rs 1000 toll refund.", "upi_fraud"),
    ("Swiggy Money: Balance transfer to bank. Enter your 4-digit UPI security code to approve credit.", "upi_fraud"),
    ("MakeMyTrip ticket cancellation: Authorize incoming transaction with Google Pay PIN to receive Rs 8500.", "upi_fraud"),
    ("IRCTC ticket refund: Enter your UPI PIN to claim tatkal train refund amount.", "upi_fraud"),
    ("Free petrol voucher worth Rs 500 from HPCL. Scan QR and confirm with UPI PIN to receive cashback.", "upi_fraud"),
    ("BookMyShow refund for cancelled concert: Enter UPI PIN to approve reverse payment credit.", "upi_fraud"),

    # 5. lottery_scam (30 examples)
    ("Congratulations! You have won Rs 25,00,000 in Kaun Banega Crorepati (KBC) lottery. Call manager Rana Pratap at 9811223344.", "lottery_scam"),
    ("Dear mobile user, your phone number has won £750,000 in the UK National Lottery 2024. Send email to claim.", "lottery_scam"),
    ("You have won a brand new Tata Safari car in Coca-Cola lucky draw! Pay Rs 15,000 registration tax to claim car.", "lottery_scam"),
    ("KBC WhatsApp Lucky Draw: Your number won 25 Lakhs. Contact head office Mumbai immediately on WhatsApp.", "lottery_scam"),
    ("Lucky Winner: You are selected for Chevrolet Cruze sweepstakes prize. Transfer delivery charges to dispatch vehicle.", "lottery_scam"),
    ("Dubai Shopping Festival: Your passport number won 500 grams of pure 24K gold. Pay customs clearance fee.", "lottery_scam"),
    ("United Nations Compensation Commission: You are entitled to $1.5 Million USD scam compensation fund. Send processing fee.", "lottery_scam"),
    ("Apple Annual Lucky Draw: Your email was chosen to win an iPhone 16 Pro Max and $50,000 cash prize.", "lottery_scam"),
    ("BMW Promo Winner: You won BMW X5 Series in German lottery. Contact claims attorney in London.", "lottery_scam"),
    ("Dear Winner, your mobile SIM card has won Rs 1 crore in Jio Diwali mega bumper draw. Call lottery officer.", "lottery_scam"),
    ("Samsung Electronics: Congratulations! You won 1st prize in Asian regional consumer sweepstakes.", "lottery_scam"),
    ("Mega Millions USA: Unclaimed jackpot ticket belongs to your email handle. Respond to claim prize.", "lottery_scam"),
    ("FIFA World Cup 2026 Promo: You won $250,000 in promotional lottery draw. Send ID proof and wire transfer fee.", "lottery_scam"),
    ("Tesco Supermarket customer lottery: You won £50,000 shopping voucher and cash reward.", "lottery_scam"),
    ("Shell Petroleum International: Selected winner for oil exploration dividend lottery. Contact agent.", "lottery_scam"),
    ("Walmart anniversary celebration: You are the 1,000,000th visitor. Claim your $10,000 Walmart gift card now.", "lottery_scam"),
    ("Audi luxury car prize: Claim your brand new Audi A6. Pay road tax and insurance fees to transport car.", "lottery_scam"),
    ("Hero MotoCorp festive contest: You won a Splendor motorcycle. Deposit courier charge of Rs 4500 to send RC book.", "lottery_scam"),
    ("Emirates Airlines promo: You won 2 free first class tickets to Paris plus $10,000 spending money.", "lottery_scam"),
    ("Google Official Lottery: Google awarded your Gmail account $850,000. Send personal details to claim check.", "lottery_scam"),
    ("WhatsApp Anniversary Draw: You won 50,000 Euros. Contact our diplomatic courier agent in South Africa.", "lottery_scam"),
    ("Canadian Green Card Lottery: Your application was selected. Pay visa processing fee of $800 immediately.", "lottery_scam"),
    ("Rolex watch sweepstakes: You won a Rolex Submariner. Transfer shipping fee to claim luxury watch.", "lottery_scam"),
    ("Singapore Tourism lucky draw: Won all-expense paid vacation for family plus 100,000 SGD cash prize.", "lottery_scam"),
    ("Harley-Davidson bike contest: Congratulations lucky customer! Pay state tax to deliver your motorcycle.", "lottery_scam"),
    ("British Airways promotional sweepstake: Winner of £100,000 travel allowance. Contact claim officer.", "lottery_scam"),
    ("Gold coin lucky draw from Tanishq: You won 100g pure gold coin. Pay postal insurance fee to receive package.", "lottery_scam"),
    ("Nestle chocolate golden ticket winner: Claim Rs 10 Lakhs by replying to this message with bank details.", "lottery_scam"),
    ("KBC bumper prize: Check your lottery number on website and deposit processing fee into SBI account.", "lottery_scam"),
    ("Starbucks annual customer award: You won free coffee for life and $25,000 check.", "lottery_scam"),

    # 6. job_scam (30 examples)
    ("Work from home part-time job! Earn Rs 3,000 to Rs 8,000 daily by liking YouTube videos. Contact HR on Telegram @EarnDaily", "job_scam"),
    ("Amazon Hiring: Part-time product review assistants needed. Work 1 hour daily, earn Rs 50,000 per month. Join WhatsApp group.", "job_scam"),
    ("Earn daily Rs 2,000 - 5,000 doing simple data entry and captcha typing work from home. No experience needed.", "job_scam"),
    ("Google Maps review job: Earn Rs 150 per Google review. Daily payment guaranteed via UPI. Message Telegram manager.", "job_scam"),
    ("Urgent hiring in Marriott Hotels Dubai: Salary 8,500 AED. Free food and accommodation. Pay visa processing fee to recruiter.", "job_scam"),
    ("Instagram influencer assistant: Watch reels and get paid Rs 200 per reel. Minimum daily payout Rs 2500.", "job_scam"),
    ("Crypto task job: Complete small deposit tasks on our trading platform and earn 30% commission daily. Join Telegram.", "job_scam"),
    ("TikTok video promotion job: Like and follow accounts to earn $50 per task. Instant payment into Binance wallet.", "job_scam"),
    ("Tata Consultancy Services: Selected for junior software engineer position. Pay laptop security deposit of Rs 12,000.", "job_scam"),
    ("Shopee / Flipkart merchant assistant: Place prepaid dummy orders to boost product ranking and get 20% commission back.", "job_scam"),
    ("Work from mobile: Copy paste SMS job. Earn Rs 1000 per 100 SMS sent. Initial software registration fee Rs 500.", "job_scam"),
    ("Online typing job: Type handwritten English manuscripts. Earn Rs 40 per page. Pay training kit fee.", "job_scam"),
    ("Oil rig job in Canada: Salary $12,000/month. No qualification required. Send $500 for medical fitness certificate.", "job_scam"),
    ("Voice over artist needed: Read children stories from home. Pay registration fee for voice test audition.", "job_scam"),
    ("Airline ground staff hiring: Indigo Airlines ticketing executive. Pay Rs 8,500 for uniform and security pass.", "job_scam"),
    ("Netflix subtitle translator job: Translate subtitles from English to Hindi. Earn Rs 45,000/month. Deposit security fee.", "job_scam"),
    ("Digital marketing internship: Earn Rs 25,000 stipend. Must pay certification enrollment fee upfront.", "job_scam"),
    ("Proofreading remote job: Earn $35 per hour editing documents. Pay registration fee on freelance platform.", "job_scam"),
    ("Hotel booking rating job: Give 5 star rating on Tripadvisor and earn Rs 300 per review. Join Telegram channel.", "job_scam"),
    ("Online survey job: Fill 5 surveys daily and get paid Rs 1500 directly in bank. Buy survey software license.", "job_scam"),
    ("App testing gig: Download mobile apps and review them. Earn Rs 500 per app test. Register with deposit.", "job_scam"),
    ("Graphic design remote project: Selected without portfolio. Pay software kit delivery charge to start.", "job_scam"),
    ("Packaging job from home: Pack pen and pencils at home. Material delivered to doorstep. Pay security deposit.", "job_scam"),
    ("Medical billing remote entry: Earn Rs 60,000 per month. Buy proprietary medical software key.", "job_scam"),
    ("Content writing gig: High paying daily work. Submit application fee to access client list.", "job_scam"),
    ("Virtual assistant for overseas executive: Receive funds into your account and forward via crypto. Earn 10% commission.", "job_scam"),
    ("Railway recruitment board (RRB) direct job offer: Clerk post confirmed. Pay bribe / processing fee to middleman.", "job_scam"),
    ("Bank PO direct selection without exam: Pay Rs 50,000 to ministry insider for appointment letter.", "job_scam"),
    ("Cruise ship job in Mediterranean: High salary in Euro. Send money for maritime travel visa.", "job_scam"),
    ("Mystery shopper job: We send you a check for $3000. Deposit check, keep $500, wire remaining money via Western Union.", "job_scam"),

    # 7. impersonation / social_engineering (25 examples)
    ("Hi, this is your CEO Mark. I am currently in an urgent meeting with clients and cannot take calls. Please buy $500 Apple gift cards and send codes.", "impersonation"),
    ("Hello dad, I dropped my phone in the water and this is my friend's number. Please transfer Rs 10,000 urgently to my friend's UPI.", "impersonation"),
    ("This is Inspector Vikram from Cyber Crime Cell Delhi. A parcel containing drugs has been intercepted in your name. Call immediately to avoid arrest.", "impersonation"),
    ("CBI Notice: You are implicated in an international money laundering investigation. You are placed under digital arrest. Do not disconnect video call.", "social_engineering"),
    ("Hi, I am your bank manager speaking from head branch. We are upgrading server security. Please share the 6 digit OTP you just received.", "social_engineering"),
    ("Telecom Regulatory Authority of India (TRAI): All SIM cards registered under your Aadhaar will be disconnected within 2 hours due to illegal broadcasts.", "social_engineering"),
    ("Mumbai Police Crime Branch: An arrest warrant has been issued against you under section 420. Settle penalty immediately.", "social_engineering"),
    ("Hey buddy, I am stuck at the highway hospital after a bike accident. Need urgent blood transfusion and Rs 15,000. Send to this UPI.", "impersonation"),
    ("Customs Department at IGI Airport: A diplomatic parcel with foreign currency addressed to you has been held. Pay customs clearance duty.", "social_engineering"),
    ("Hi, this is IT Support. We noticed suspicious outbound traffic from your workstation. Please install AnyDesk or TeamViewer and give remote access code.", "social_engineering"),
    ("Your electricity connection will be cut at 10 PM tonight by power department officer. Contact junior engineer at 9812345678 to update payment.", "impersonation"),
    ("Hello dear, I am US Army General David serving in Syria. I found a box of gold and want to ship it to you for safekeeping. Pay courier fees.", "social_engineering"),
    ("Speed Post Tracking: Delivery failed because house was locked. Click here to confirm address and pay redelivery charge of Rs 25.", "social_engineering"),
    ("Traffic Police E-Challan: You have an unpaid overspeeding fine of Rs 2000. Pay via APK link or driving license will be cancelled.", "social_engineering"),
    ("Court Summons: You have been summoned by Supreme Court in case #9021. Download legal notice PDF attached.", "social_engineering"),
    ("WhatsApp Gold Edition: Exclusive secret version of WhatsApp with video call recording and invisible mode. Upgrade here.", "social_engineering"),
    ("Hi grandma, it's your grandson Michael. I got into legal trouble while traveling in Mexico. Please wire bail money to the lawyer.", "impersonation"),
    ("Chief Financial Officer message: Need you to execute a confidential wire transfer to an acquisition escrow account before end of day.", "impersonation"),
    ("Airtel 5G VIP SIM upgrade: Convert your 4G SIM to 5G high speed by forwarding incoming SMS to 121.", "social_engineering"),
    ("Income Tax Department raid notice: Discrepancy found in your ITR return. Deposit pending advance tax to avoid raid.", "social_engineering"),
    ("Gas agency customer care: Your LPG subsidy is blocked. Share bank account details and debit card expiration date to reactivate.", "impersonation"),
    ("Nodal Officer: Your Aadhaar has been used in human trafficking case in Cambodia. Transfer assets to RBI safety account for verification.", "social_engineering"),
    ("Hi, I am calling from your credit card security department. Someone is trying to charge $900 on your card. Tell me the OTP to block payment.", "social_engineering"),
    ("Provident Fund (EPFO) alert: Your PF withdrawal request is processed. Submit Aadhaar OTP to deposit Rs 1,20,000 into account.", "social_engineering"),
    ("Your matrimonial profile match: I am interested in your bio. I am sending an expensive gift from London. Pay customs clearance in Delhi.", "social_engineering"),
]


class ScamClassifier:
    """Scikit-Learn ML classifier predicting threat categories from text semantics."""

    CATEGORIES = [
        "legitimate",
        "phishing",
        "financial_scam",
        "upi_fraud",
        "lottery_scam",
        "job_scam",
        "social_engineering",
        "impersonation",
    ]

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join(settings.MODEL_CACHE_DIR, "scam_classifier.joblib")
        self.pipeline: Optional[Pipeline] = None
        self._is_trained = False

    def clean_text(self, text: str) -> str:
        """Normalize text representation."""
        t = text.lower()
        t = re.sub(r"https?://\S+|www\.\S+", " urltoken ", t)
        t = re.sub(r"\b\d{10}\b", " phonetoken ", t)
        t = re.sub(r"\b\d+\b", " numtoken ", t)
        t = re.sub(r"[^\w\s]", " ", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t

    def train(self) -> Dict[str, Any]:
        """Train TF-IDF + Multinomial Naive Bayes pipeline on inline dataset."""
        logger.info("training_scam_classifier", total_samples=len(TRAINING_DATA))
        
        texts = [self.clean_text(sample[0]) for sample in TRAINING_DATA]
        labels = [sample[1] for sample in TRAINING_DATA]

        # Pipeline: sublinear TF scaling, n-gram ranges 1-2, laplace smoothed Naive Bayes
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True,
                stop_words="english",
            )),
            ("clf", MultinomialNB(alpha=0.1)),
        ])

        self.pipeline.fit(texts, labels)
        self._is_trained = True

        # Save to cache
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.pipeline, self.model_path)
            logger.info("model_saved_successfully", path=self.model_path)
        except Exception as e:
            logger.warning("model_save_failed", error=str(e))

        metrics = self.evaluate()
        return metrics

    def load_model(self, path: Optional[str] = None) -> bool:
        """Load pre-trained model from disk or train if missing."""
        target_path = path or self.model_path
        if os.path.exists(target_path):
            try:
                self.pipeline = joblib.load(target_path)
                self._is_trained = True
                logger.info("loaded_cached_model", path=target_path)
                return True
            except Exception as e:
                logger.warning("failed_loading_cached_model", error=str(e))

        # Train freshly
        self.train()
        return True

    def ensure_trained(self) -> None:
        """Ensure pipeline is loaded and ready for inference."""
        if not self._is_trained or self.pipeline is None:
            self.load_model()

    def predict(self, text: str) -> str:
        """Predict the primary threat class."""
        self.ensure_trained()
        cleaned = self.clean_text(text)
        if not cleaned:
            return "legitimate"
        prediction = self.pipeline.predict([cleaned])[0]
        return str(prediction)

    def get_confidence(self, text: str) -> Dict[str, float]:
        """Return confidence distribution across threat classes."""
        self.ensure_trained()
        cleaned = self.clean_text(text)
        if not cleaned:
            return {"legitimate": 1.0}

        probs = self.pipeline.predict_proba([cleaned])[0]
        classes = self.pipeline.classes_

        res = {str(cls): round(float(prob), 4) for cls, prob in zip(classes, probs)}
        return dict(sorted(res.items(), key=lambda x: x[1], reverse=True))

    def evaluate(self) -> Dict[str, Any]:
        """Compute evaluation metrics on training distribution."""
        self.ensure_trained()
        texts = [self.clean_text(sample[0]) for sample in TRAINING_DATA]
        labels = [sample[1] for sample in TRAINING_DATA]
        preds = self.pipeline.predict(texts)
        
        report = classification_report(labels, preds, output_dict=True, zero_division=0)
        return {
            "accuracy": report.get("accuracy", 0.0),
            "macro_avg_f1": report.get("macro avg", {}).get("f1-score", 0.0),
            "total_samples": len(TRAINING_DATA),
        }


# Singleton classifier instance
scam_classifier = ScamClassifier()
