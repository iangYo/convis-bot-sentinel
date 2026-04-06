import os
import re
from dataclasses import dataclass
from typing import Optional
import requests
from bs4 import BeautifulSoup


@dataclass(frozen=True)
class TelegramConfig:
    bot_token: str
    chat_id: str


@dataclass(frozen=True)
class VisitInfo:
    sector: str
    cell: str
    date: str
    entry_time: str


BASE_URL = os.getenv("BASE_URL")
CALENDAR_URL = f"{BASE_URL}/diasdevisita.xhtml"
TARGET_SECTOR = os.getenv("TARGET_SECTOR")
TARGET_CELL = os.getenv("TARGET_CELL")


def extract_visit_date(table) -> Optional[str]:
    """Extract visit date from table."""
    date_div = table.find("div", class_=re.compile(r"FontRobotoLight.*Fs16"))
    return date_div.get_text(strip=True) if date_div else None


def extract_entry_time(table) -> Optional[str]:
    """Extract entry time from table."""
    hora_span = table.find("span", class_="ui-column-title", string="Hora Entrada")
    if hora_span:
        td = hora_span.find_parent("td")
        if td:
            return td.get_text(strip=True).replace("Hora Entrada", "").strip()
    return None


def find_visit_info(html: str) -> Optional[VisitInfo]:
    """Find visit information for specific sector and cell."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Find sector span with cell number
    element = soup.find(
        "span",
        class_=re.compile(r"Fs14.*FontVoltSemiBold"),
        string=lambda s: s and TARGET_SECTOR in s and re.search(rf"Celas:.*\b{TARGET_CELL}\b", s)
    )
    
    if not element:
        return None
    
    # Find parent table with visit details
    table = element.find_parent("table")
    if not table:
        return None
    
    visit_date = extract_visit_date(table)
    entry_time = extract_entry_time(table)
    
    if not visit_date or not entry_time:
        return None
    
    return VisitInfo(
        sector=TARGET_SECTOR,
        cell=TARGET_CELL,
        date=visit_date,
        entry_time=entry_time
    )


def check_calendar(session: requests.Session) -> Optional[VisitInfo]:
    """Fetch calendar page and find visit info."""
    response = session.get(CALENDAR_URL)
    response.raise_for_status()
    return find_visit_info(response.text)


def create_visit_message(visit_info: VisitInfo) -> str:
    return (
        f"📅 PRÓXIMA VISITA DISPONÍVEL\n\n"
        f"🏢 Setor: {visit_info.sector}\n"
        f"🔢 Cela: {visit_info.cell}\n"
        f"📆 Data: {visit_info.date}\n"
        f"🕐 Horário de Entrada: {visit_info.entry_time}\n\n"
        f"✅ Faça sua reserva o quanto antes!"
    )


def send_telegram_message(config: TelegramConfig, message: str) -> None:
    """Send message via Telegram."""
    url = f"https://api.telegram.org/bot{config.bot_token}/sendMessage"
    payload = {"chat_id": config.chat_id, "text": message}
    requests.post(url, json=payload)


def load_telegram_config() -> Optional[TelegramConfig]:
    """Load Telegram config from environment."""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        return None
    
    return TelegramConfig(bot_token=bot_token, chat_id=chat_id)


def main() -> None:
    print("Checking next available visit...")
    
    telegram_config = load_telegram_config()
    
    session = requests.Session()
    visit_info = check_calendar(session)
    
    if visit_info:
        print(f"Found visit: {visit_info.date} at {visit_info.entry_time}")
        
        if telegram_config:
            message = create_visit_message(visit_info)
            send_telegram_message(telegram_config, message)
            print("Notification sent!")
        else:
            print("Warning: Telegram not configured")
    else:
        print("No matching visit found")


if __name__ == "__main__":
    main()
