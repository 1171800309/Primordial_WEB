<template>
  <AuthPageShell
    title="隐私政策"
    subtitle="YI QI PRIVACY POLICY"
    scrollable
    :show-hero-logo="false"
    :header-link="{ to: '/register', label: '返回注册' }"
  >
    <article class="legal-doc">
      <section>
        <h2>一、我们收集的信息</h2>
        <p>
          为完成注册与服务提供，我们会收集你提交的手机号、用户名、密码、邮箱（可选）、性别、出生信息与地区信息。
        </p>
      </section>
      <section>
        <h2>二、信息使用目的</h2>
        <p>你的信息用于账号创建、身份验证、八字与词卡功能计算、服务安全与必要的运维分析。</p>
      </section>
      <section>
        <h2>三、信息存储与保护</h2>
        <p>我们采用合理的技术与管理措施保护数据安全，限制未授权访问、披露、篡改与丢失。</p>
      </section>
      <section>
        <h2>四、信息共享</h2>
        <p>
          在法律法规要求或监管机关依法要求的情况下，我们可能依法披露必要信息。除法定情形外，不会擅自出售你的个人信息。
        </p>
      </section>
      <section>
        <h2>五、你的权利</h2>
        <p>你可申请查询、更正或删除个人信息。若你注销账号，我们将按法律要求处理相关数据。</p>
      </section>
    </article>
  </AuthPageShell>
</template>

<script setup>
import AuthPageShell from '@/components/layout/AuthPageShell.vue'
</script>
