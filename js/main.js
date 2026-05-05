/**
 * CALL92 公式サイト — メインスクリプト
 * 制作: TEZUIntelligence
 *
 * 機能:
 *  - ヘッダースクロール制御
 *  - モバイルメニュー
 *  - FAQアコーディオン
 *  - スクロールアニメーション (Intersection Observer)
 *  - パーサラックス効果（ヒーロー）
 *  - 予約フォーム送信処理
 *  - お問い合わせフォーム送信処理
 */

'use strict';

/* ============================================================
   1. ヘッダー — スクロールで背景色を付ける
   ============================================================ */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初期実行
})();


/* ============================================================
   2. モバイルメニュー
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // メニュー内リンクをクリックしたら閉じる
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
})();


/* ============================================================
   3. FAQアコーディオン
   ============================================================ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // 他のアイテムを閉じる
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      // 対象を開閉
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();


/* ============================================================
   4. スクロールアニメーション (Intersection Observer)
   ============================================================ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   5. ヒーロー パーシャルパーサラックス
   ============================================================ */
(function initParallax() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const offset = scrollY * 0.35;
    heroBg.style.transform = `scale(1.04) translateY(${offset}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ============================================================
   6. 予約フォーム処理
   ============================================================
   現在の実装:
   - Formspree を使用（action属性のURLを変更するだけで動作）
   - クライアントサイドのバリデーション付き
   - 送信後に完了メッセージを表示

   将来の拡張ポイント:
   - Google Apps Script Webhook に変更 → Googleスプレッドシートへ自動記録
   - Calendly / Airbnb API と連携して空室確認を自動化
   - じゃらん・楽天トラベル OTA API と接続するためのバックエンドエンドポイントに変更
   - AIチャット（例: Claude API）と連携して予約案内を自動化
   ============================================================ */
(function initBookingForm() {
  const form = document.getElementById('booking-form');
  const successMsg = document.getElementById('booking-success');
  if (!form) return;

  // 日付の最小値を今日に設定
  const today = new Date().toISOString().split('T')[0];
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');

  if (checkinInput) {
    checkinInput.setAttribute('min', today);
    checkinInput.addEventListener('change', () => {
      if (checkoutInput) {
        checkoutInput.setAttribute('min', checkinInput.value);
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = '';
        }
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
      // ======================================================
      // submitted_at（送信日時）を hidden フィールドにセット
      // GAS連携時にスプレッドシートの「送信日時」列に入る
      // ======================================================
      const submittedAtField = document.getElementById('submitted_at');
      if (submittedAtField) {
        submittedAtField.value = new Date().toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
      }

      // ======================================================
      // フォームデータを取得
      // GASスプレッドシート列: 送信日時 / ステータス / チェックイン /
      //   チェックアウト / 人数 / 希望プラン / 利用目的 / BBQ希望 /
      //   氏名 / メール / 電話 / 要望 / 対応状況
      // ======================================================
      const data = {
        submitted_at: submittedAtField ? submittedAtField.value : '',
        site_name:    'CALL92',
        status:       '仮受付',
        response:     '未対応',
        checkin:      form.checkin.value,
        checkout:     form.checkout.value,
        guests:       form.guests.value,
        plan:         form.plan ? form.plan.value : '',
        purpose:      form.purpose ? form.purpose.value : '',
        bbq:          form.bbq ? form.bbq.value : '',
        name:         form.name.value,
        email:        form.email.value,
        phone:        form.phone.value,
        message:      form.message.value,
      };

      // ======================================================
      // TODO: 以下のURLを実際の送信先に差し替えてください
      //
      // 選択肢1: Formspree (最も簡単)
      //   → https://formspree.io でフォームIDを取得し差し替え
      //   const endpoint = 'https://formspree.io/f/YOUR_FORM_ID';
      //
      // 選択肢2: Google Apps Script (スプレッドシート + カレンダー自動記録)
      //   → GAS でウェブアプリをデプロイしてURLを差し替え
      //   const endpoint = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
      //   ※ GASスクリプト例は SETUP.md Step 4 を参照
      //
      //   GAS連携時の動作フロー:
      //   1. フォーム送信 → GAS Webhook 受信
      //   2. Googleスプレッドシートに自動記録（上記の列構成）
      //   3. Googleカレンダーに仮予約を登録
      //      タイトル: 仮予約 - {氏名} - {人数}
      //      開始日: checkin, 終了日: checkout
      //      説明欄: プラン/目的/BBQ/電話/メール/要望
      //   4. 宿主へのメール通知を送信
      //   5. 必要に応じて LINE Messaging API で自動返信
      //
      // 選択肢3: Vercel Serverless Function (バックエンド実装)
      //   const endpoint = '/api/booking';
      //
      // 将来: OTA連携 (じゃらん/楽天トラベル)
      //   const endpoint = '/api/ota-sync';
      // ======================================================
      const endpoint = 'https://formspree.io/f/YOUR_FORM_ID'; // ← ここを差し替え

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // 送信成功
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';

        // ======================================================
        // TODO: 送信成功後の拡張処理
        //
        // 例1: Googleカレンダーへのブロック (GAS経由)
        // 例2: 宿主への SMS通知 (Twilio API)
        // 例3: AIによる自動確認メール生成 (Claude API)
        // ======================================================

      } else {
        throw new Error('送信に失敗しました');
      }

    } catch (error) {
      // 開発中は直接成功として扱う（フォームIDが未設定のため）
      // 本番では以下のコメントを外してエラー表示に変更してください
      // alert('送信中にエラーが発生しました。お電話かメールでお問い合わせください。');

      // 開発用: そのまま完了メッセージを表示（Formspree未接続時の確認用）
      console.warn('Formspree未設定 — 開発モードで完了メッセージを表示します');
      form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();


/* ============================================================
   7. お問い合わせフォーム処理
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('contact-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
      const data = {
        name:    form.contact_name.value,
        email:   form.contact_email.value,
        subject: form.contact_subject.value,
        message: form.contact_message.value,
      };

      // TODO: 予約フォームと同様にエンドポイントを差し替えてください
      const endpoint = 'https://formspree.io/f/YOUR_CONTACT_FORM_ID'; // ← ここを差し替え

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok || true) { // 開発中は常に成功
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      }

    } catch (error) {
      console.warn('Contact form: 開発モード');
      form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();


/* ============================================================
   8. フローティングCTAのスクロール制御
   ============================================================ */
(function initFloatCTA() {
  const floatCta = document.getElementById('float-cta');
  if (!floatCta) return;

  window.addEventListener('scroll', () => {
    // ページ下部（フッター付近）では非表示にする
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    const footerTop = footer.getBoundingClientRect().top;
    if (footerTop < window.innerHeight) {
      floatCta.style.opacity = '0';
      floatCta.style.pointerEvents = 'none';
    } else {
      floatCta.style.opacity = '1';
      floatCta.style.pointerEvents = 'auto';
    }
  }, { passive: true });
})();
