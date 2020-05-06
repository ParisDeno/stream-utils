const YT_MESSAGE_SELECTOR = 'yt-live-chat-text-message-renderer';
const CUSTOM_QUESTION = '<span class="custom_question">Question</span> ';
const QUESTION_TRIGGER_REG = /^#question /ig;
const ITEMS = document.querySelector('#chat #items')!;

const affectMessage = (messageNode: HTMLElement) => {
    const textNode = messageNode.querySelector<HTMLElement>('#content #message')!;
    const text = textNode.innerText;
    if (QUESTION_TRIGGER_REG.test(text)) {
        textNode.innerHTML = text.replace(QUESTION_TRIGGER_REG, CUSTOM_QUESTION);
    } else if (textNode.innerHTML.startsWith(CUSTOM_QUESTION)) {
        return;
    } else {
        messageNode.parentNode!.removeChild(messageNode);
    }

}

for (const item of Array.from(document.querySelectorAll<HTMLElement>(YT_MESSAGE_SELECTOR))) {
    affectMessage(item);
}
ITEMS.parentElement!.style.height = `${ITEMS.clientHeight}px`;

const questionObs = new MutationObserver(muts => {
    const m = muts[0];
    if (m.type === 'childList' && !m.removedNodes.length) {
        affectMessage(m.addedNodes[0] as HTMLElement);
    }
    ITEMS.parentElement!.style.height = `${ITEMS.clientHeight}px`;
});

questionObs.observe(ITEMS, { childList: true });