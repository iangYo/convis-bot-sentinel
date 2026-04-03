import os
import re
from dataclasses import dataclass
from typing import Optional
import requests
from bs4 import BeautifulSoup


@dataclass(frozen=True)
class Credentials:
    cpf: str
    card_number: str


@dataclass(frozen=True)
class TelegramConfig:
    bot_token: str
    chat_id: str

BASE_URL = os.getenv("BASE_URL")
LOGIN_URL = f"{BASE_URL}/login.xhtml"
BUTTON_SELECTOR = 'button[id$="btnEmitir"]'


def get_view_state(html: str) -> str:
    """Extract JSF ViewState from login page."""
    match = re.search(r'name="javax\.faces\.ViewState".*?value="([^"]+)"', html)
    if not match:
        raise ValueError("ViewState not found in HTML")
    return match.group(1)


def get_redirect_url(response_text: str) -> str:
    """Extract redirect URL from login response."""
    match = re.search(r'<redirect url="([^"]+)"', response_text)
    if not match:
        raise ValueError("Login failed: No redirect URL found")
    
    url = match.group(1)
    return url if url.startswith("http") else BASE_URL + url


def is_button_enabled(html: str) -> bool:
    """Check if the button is enabled (not disabled)."""
    soup = BeautifulSoup(html, 'html.parser')
    button = soup.select_one(BUTTON_SELECTOR)
    
    if not button:
        raise ValueError(f"Button not found with selector: {BUTTON_SELECTOR}")
    
    return not button.has_attr('disabled')


def login_and_check_button(session: requests.Session, credentials: Credentials) -> bool:
    response = session.get(LOGIN_URL)
    response.raise_for_status()
    view_state = get_view_state(response.text)
    
    payload = {
        "javax.faces.partial.ajax": "true",
        "javax.faces.source": "formLogin:btnEmitir",
        "javax.faces.partial.execute": "@all",
        "javax.faces.partial.render": "formLogin",
        "formLogin:btnEmitir": "formLogin:btnEmitir",
        "formLogin": "formLogin",
        "formLogin:cpfCampo": credentials.cpf,
        "formLogin:carteirinha": credentials.card_number,
        "javax.faces.ViewState": view_state
    }
    
    headers = {
        "Faces-Request": "partial/ajax",
        "X-Requested-With": "XMLHttpRequest"
    }
    
    response = session.post(LOGIN_URL, data=payload, headers=headers)
    response.raise_for_status()
    
    redirect_url = get_redirect_url(response.text)
    response = session.get(redirect_url)
    response.raise_for_status()
    
    return is_button_enabled(response.text)


def send_telegram_alert(config: TelegramConfig) -> None:
    url = f"https://api.telegram.org/bot{config.bot_token}/sendMessage"
    message = (
        "BOT EM TESTES, IGNORE ESTA MENSAGEM\n"
        "⚔️ RELATÓRIO DE VIGILÂNCIA\n"
        "Status do Botão: LIBERADO\n"
        "Ação Requerida: O robô detectou que o botão não está mais desabilitado. "
        "Entre no sistema imediatamente para evitar ineficiências."
    )
    
    payload = {"chat_id": config.chat_id, "text": message}
    requests.post(url, json=payload)


def load_credentials() -> Credentials:
    cpf = os.getenv("LOGIN_CPF")
    card_number = os.getenv("LOGIN_CARTEIRINHA")
    
    if not cpf or not card_number:
        raise ValueError("LOGIN_CPF and LOGIN_CARTEIRINHA must be set")
    
    return Credentials(cpf=cpf, card_number=card_number)


def load_telegram_config() -> Optional[TelegramConfig]:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        return None
    
    return TelegramConfig(bot_token=bot_token, chat_id=chat_id)


def main() -> None:
    print("Starting surveillance...")
    
    credentials = load_credentials()
    telegram_config = load_telegram_config()
    
    session = requests.Session()
    button_enabled = login_and_check_button(session, credentials)
    
    if button_enabled:
        print("ALERT: Button is enabled! Sending notification...")
        if telegram_config:
            send_telegram_alert(telegram_config)
        else:
            print("Warning: Telegram not configured")
    else:
        print("All normal. Button is disabled.")


if __name__ == "__main__":
    main()