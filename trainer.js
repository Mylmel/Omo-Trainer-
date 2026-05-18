// trainer.js — реплики тренера при отказе (v0.30)

const trainerPhrases = {
  en: [
    "No, {name}. You just went. Hold it a little longer.",
    "Permission denied, {name}. You need to learn patience.",
    "Not yet, {name}. Try to distract yourself.",
    "Denied, {name}. The toilet is occupied.",
    "I don't think so, {name}. You can wait.",
    "Keep holding, {name}. You're doing great.",
    "No way, {name}. Not until I say so.",
    "Denied. You've been asking too much, {name}.",
    "Hold it, {name}. You don't need to go yet.",
    "Not this time, {name}. Maybe in 10 minutes."
  ],
  ru: [
    "Нет, {name}. Ты только что сходил. Потерпи ещё немного.",
    "Отказано, {name}. Тебе нужно учиться терпению.",
    "Пока нет, {name}. Попробуй отвлечься.",
    "Отказано, {name}. Туалет занят.",
    "Я так не думаю, {name}. Ты можешь подождать.",
    "Продолжай терпеть, {name}. У тебя отлично получается.",
    "Ни за что, {name}. Пока я не разрешу.",
    "Отказано. Ты слишком часто просишь, {name}.",
    "Терпи, {name}. Тебе ещё рано идти.",
    "Не в этот раз, {name}. Может, через 10 минут."
  ],
  de: [
    "Nein, {name}. Du warst gerade erst. Halt noch etwas länger.",
    "Verweigert, {name}. Du musst Geduld lernen.",
    "Noch nicht, {name}. Versuch dich abzulenken.",
    "Verweigert, {name}. Die Toilette ist besetzt.",
    "Glaube ich nicht, {name}. Du kannst warten.",
    "Weiterhalten, {name}. Du machst das großartig.",
    "Auf keinen Fall, {name}. Nicht bis ich es sage.",
    "Verweigert. Du fragst zu oft, {name}.",
    "Halt durch, {name}. Du musst noch nicht gehen.",
    "Diesmal nicht, {name}. Vielleicht in 10 Minuten."
  ],
  fr: [
    "Non, {name}. Tu viens d'y aller. Tiens encore un peu.",
    "Refusé, {name}. Tu dois apprendre la patience.",
    "Pas encore, {name}. Essaie de te distraire.",
    "Refusé, {name}. Les toilettes sont occupées.",
    "Je ne pense pas, {name}. Tu peux attendre.",
    "Continue à tenir, {name}. Tu t'en sors bien.",
    "Pas question, {name}. Pas avant que je le dise.",
    "Refusé. Tu as trop demandé, {name}.",
    "Tiens bon, {name}. Tu n'as pas encore besoin d'y aller.",
    "Pas cette fois, {name}. Peut-être dans 10 minutes."
  ],
  es: [
    "No, {name}. Acabas de ir. Aguanta un poco más.",
    "Permiso denegado, {name}. Necesitas aprender paciencia.",
    "Todavía no, {name}. Intenta distraerte.",
    "Denegado, {name}. El baño está ocupado.",
    "No lo creo, {name}. Puedes esperar.",
    "Sigue aguantando, {name}. Lo estás haciendo genial.",
    "De ninguna manera, {name}. Hasta que yo lo diga.",
    "Denegado. Has estado pidiendo demasiado, {name}.",
    "Aguanta, {name}. Todavía no necesitas ir.",
    "Esta vez no, {name}. Quizás en 10 minutos."
  ],
  it: [
    "No, {name}. Sei appena andato. Resisti ancora un po'.",
    "Permesso negato, {name}. Devi imparare la pazienza.",
    "Non ancora, {name}. Cerca di distrarti.",
    "Negato, {name}. Il bagno è occupato.",
    "Non credo proprio, {name}. Puoi aspettare.",
    "Continua a resistere, {name}. Stai facendo un ottimo lavoro.",
    "Niente da fare, {name}. Non finché non lo dico io.",
    "Negato. Hai chiesto troppo spesso, {name}.",
    "Resisti, {name}. Non devi ancora andare.",
    "Non questa volta, {name}. Forse tra 10 minuti."
  ],
  zh: [
    "不，{name}。你刚去过。再忍一会儿。",
    "拒绝，{name}。你需要学会耐心。",
    "还没有，{name}。试着分散注意力。",
    "拒绝，{name}。厕所被占用了。",
    "我不这么认为，{name}。你可以等。",
    "继续忍着，{name}。你做得很好。",
    "不行，{name}。除非我同意。",
    "拒绝。你问得太多了，{name}。",
    "忍住，{name}。你还不需要去。",
    "这次不行，{name}。也许10分钟后。"
  ],
  ja: [
    "ダメです、{name}。行きたばかりでしょう。もう少し我慢して。",
    "拒否します、{name}。忍耐を学ぶ必要があります。",
    "まだです、{name}。気をそらしてみて。",
    "拒否します、{name}。トイレは使用中です。",
    "そうは思いません、{name}。待てますね。",
    "そのまま我慢して、{name}。うまくやっています。",
    "絶対にダメです、{name}。私が許すまで。",
    "拒否。頼みすぎです、{name}。",
    "我慢してください、{name}。まだ行く必要はありません。",
    "今回はダメ、{name}。10分後くらいに。"
  ],
  ko: [
    "아니요, {name}. 방금 갔잖아요. 조금만 더 참으세요.",
    "거절합니다, {name}. 인내심을 배워야 합니다.",
    "아직 안 됩니다, {name}. 다른 생각을 해보세요.",
    "거절합니다, {name}. 화장실 사용 중입니다.",
    "그렇지 않은 것 같아요, {name}. 기다릴 수 있어요.",
    "계속 참으세요, {name}. 잘하고 있어요.",
    "절대 안 돼요, {name}. 내가 허락할 때까지.",
    "거절. 너무 자주 요청했어요, {name}.",
    "참으세요, {name}. 아직 갈 필요 없어요.",
    "이번은 안 돼요, {name}. 10분 후에요."
  ],
  tr: [
    "Hayır, {name}. Az önce gittin. Biraz daha tut.",
    "Reddedildi, {name}. Sabır öğrenmelisin.",
    "Henüz değil, {name}. Dikkatini dağıtmayı dene.",
    "Reddedildi, {name}. Tuvalet dolu.",
    "Sanmıyorum, {name}. Bekleyebilirsin.",
    "Tutmaya devam et, {name}. Harika gidiyorsun.",
    "Asla, {name}. Ben söyleyene kadar.",
    "Reddedildi. Çok fazla istedin, {name}.",
    "Tut, {name}. Henüz gitmene gerek yok.",
    "Bu sefer değil, {name}. Belki 10 dakika sonra."
  ]
};

function getRandomTrainerPhrase(lang, userName) {
  const phrases = trainerPhrases[lang] || trainerPhrases.en;
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex].replace("{name}", userName);
}