<template>
  <UPage>
    <UPageBody>
      <UContainer class="py-12 max-w-4xl">
        <h1 class="text-3xl font-bold mb-8">Adatkezelési Tájékoztató</h1>

        <div class="prose dark:prose-invert max-w-none">
          <p class="text-sm text-gray-500 mb-6">Hatályos: 2025. január 1-től visszavonásig</p>

          <h2>1. Az adatkezelő adatai</h2>
          <p>
            A személyes adatok kezelője: [Cégnév / Név]<br>
            Székhely: [Cím]<br>
            E-mail: info@verseskotetem.hu
          </p>

          <h2>2. A kezelt adatok köre és az adatkezelés célja</h2>
          <p>
            A szolgáltatás nyújtása során az alábbi adatokat kezeljük:
          </p>
          <ul>
            <li><strong>Kapcsolattartási adatok (név, e-mail):</strong> A szolgáltatás teljesítése, a generált tartalom elküldése és ügyfélszolgálat céljából.</li>
            <li><strong>Számlázási adatok:</strong> A számviteli törvénynek való megfelelés céljából.</li>
            <li><strong>Feltöltött tartalmak (versek):</strong> A könyv generálása céljából. Ezeket az adatokat csak a technikai folyamat idejére tároljuk.</li>
          </ul>

          <h2>3. Az adatkezelés jogalapja</h2>
          <p>
            Az adatkezelés jogalapja a szerződés teljesítése (GDPR 6. cikk (1) b)) és jogi kötelezettség teljesítése (GDPR 6. cikk (1) c) - számlázás).
          </p>

          <h2>4. Adattovábbítás</h2>
          <p>
            A fizetések feldolgozásához harmadik fél szolgáltatót (pl. Stripe/Barion) veszünk igénybe. A PDF generáláshoz külső API-t (PDFShift) használhatunk, amelynek során a tartalom ideiglenesen továbbításra kerülhet, de nem kerül tárolásra.
          </p>

          <h2>5. Az adatok tárolásának időtartama</h2>
          <p>
            A számlázási adatokat a jogszabályban előírt ideig (8 év) őrizzük meg. A generált tartalmakat a letöltési link érvényességéig (pl. 30 nap) tároljuk, utána törlésre kerülnek.
          </p>

          <h2>6. Az érintettek jogai</h2>
          <p>
            Ön jogosult tájékoztatást kérni személyes adatai kezeléséről, kérheti azok helyesbítését, törlését vagy zárolását. Jogérvényesítési lehetőségeit bíróság előtt vagy a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH) gyakorolhatja.
          </p>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
