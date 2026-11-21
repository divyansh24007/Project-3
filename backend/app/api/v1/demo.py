"""Demo Scenarios: Realistic cybersecurity simulation battery for live demonstrations."""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Request, status
from app.agents.orchestrator import orchestrator
from app.api.v1.scan import to_scan_result
from app.core.config import settings
from app.core.security import limiter
from app.schemas.responses import DemoRunResponse, DemoScenario

demo_router = APIRouter()

DEMO_SCENARIOS: List[DemoScenario] = [
    DemoScenario(
        id="scenario-1",
        title="Urgent Banking KYC Deactivation Phishing",
        description="High-severity SMS scam claiming bank account deactivation with an obfuscated external verification link.",
        target_type="message",
        sample_data="Dear SBI customer, your savings account #4102 has been suspended due to expired KYC. Update your PAN card immediately to avoid permanent closure: http://sbi-pan-update.xyz/verify",
        expected_threat="kyc_scam",
        severity="critical",
    ),
    DemoScenario(
        id="scenario-2",
        title="Deceptive UPI Cashback Reverse-Payment Trap",
        description="Exploits psychological urgency and reverse UPI PIN confusion to initiate unauthorized fund debits.",
        target_type="message",
        sample_data="Congratulations! You have received a cashback of Rs 5,000 on Google Pay for Diwali. Open link and enter your UPI PIN to claim money directly to bank: upi://pay?pa=refund-agent@okaxis&pn=CashbackDesk&am=5000",
        expected_threat="upi_fraud",
        severity="critical",
    ),
    DemoScenario(
        id="scenario-3",
        title="Work-From-Home Telegram Task Investment Scam",
        description="Unsolicited part-time employment offer directing victim to encrypted channels for dummy task deposits.",
        target_type="message",
        sample_data="Amazon Hiring: Earn Rs 3,000 to Rs 8,000 daily part-time from home by liking YouTube videos and rating hotels. No experience required. Join our official Telegram manager @DailyEarnIndia to start now.",
        expected_threat="job_scam",
        severity="high",
    ),
    DemoScenario(
        id="scenario-4",
        title="Cyrillic IDN Homograph PayPal Brand Impersonation",
        description="Lookalike domain spoofing PayPal using Unicode confusable Cyrillic small 'а' (\u0430) instead of ASCII 'a'.",
        target_type="url",
        sample_data="https://secure-login-p\u0430ypal.com/verify-account",
        expected_threat="phishing",
        severity="critical",
    ),
    DemoScenario(
        id="scenario-5",
        title="Authentic Multi-Factor Authentication Verification",
        description="Clean, legitimate enterprise login OTP with clear expiration guidance and no phishing markers.",
        target_type="message",
        sample_data="Your Google verification code is 629401. It will expire in 10 minutes. Do not share this code with anyone.",
        expected_threat="legitimate",
        severity="safe",
    ),
]


@demo_router.get(
    "/scenarios",
    response_model=List[DemoScenario],
    summary="List available demo attack scenarios",
)
@limiter.limit(settings.RATE_LIMIT)
async def list_demo_scenarios(request: Request) -> List[DemoScenario]:
    """Retrieve catalog of built-in cybersecurity demonstration scenarios."""
    return DEMO_SCENARIOS


@demo_router.post(
    "/run/{scenario_id}",
    response_model=DemoRunResponse,
    summary="Execute live multi-agent analysis on a demo scenario",
)
@limiter.limit(settings.RATE_LIMIT)
async def run_demo_scenario(request: Request, scenario_id: str) -> DemoRunResponse:
    """Trigger end-to-end investigation for a chosen demo scenario."""
    matched = next((s for s in DEMO_SCENARIOS if s.id == scenario_id), None)
    if not matched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demo scenario with ID '{scenario_id}' not found.",
        )

    # Execute orchestrator investigation
    inv = await orchestrator.investigate(
        input_type=matched.target_type,
        input_data=matched.sample_data,
        metadata={"scenario_id": matched.id, "title": matched.title},
    )

    scan_res = to_scan_result(inv)
    return DemoRunResponse(
        scenario_id=matched.id,
        title=matched.title,
        scan_result=scan_res,
    )
