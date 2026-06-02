<template>
  <AuthPageShell
    title="用户协议"
    subtitle="YI QI USER AGREEMENT"
    scrollable
    :show-hero-logo="false"
    :header-link="{ to: '/register', label: '返回注册' }"
  >
    <article class="legal-doc">
      <section>
        <h2>一、协议范围</h2>
        <p>
          本协议适用于你访问与使用一炁文化网站及相关功能。注册成功后，你可使用账号进行登录、词卡体验与个人信息管理。
        </p>
      </section>
      <section>
        <h2>二、账号与安全</h2>
        <p>你应提供真实、完整的信息并妥善保管账号密码，不得将账号出借、出售或用于违法违规用途。</p>
      </section>
      <section>
        <h2>三、服务说明</h2>
        <p>
          本站内容为文化探索与娱乐参考，不构成医疗、法律、投资等专业建议。你应独立判断并自行承担使用结果。
        </p>
      </section>
      <section>
        <h2>四、用户行为规范</h2>
        <p>你不得发布违法信息、侵害他人权益或干扰平台正常运行。我们有权对违规账号采取限制或封禁措施。</p>
      </section>
      <section>
        <h2>五、协议更新</h2>
        <p>协议条款可能根据业务发展进行调整，更新后在页面公示并自公示之日起生效。</p>
      </section>
    </article>
  </AuthPageShell>
</template>

<script setup>
import AuthPageShell from '@/components/layout/AuthPageShell.vue'
</script>
