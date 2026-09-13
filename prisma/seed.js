const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed execution with Nursing and Rehab roles...');

  // 1. Create Industry & Categories
  const careIndustry = await prisma.industry.upsert({
    where: { slug: 'care' },
    update: {},
    create: {
      name: '介護福祉',
      slug: 'care',
    },
  });

  const categoryNames = [
    '人手不足', '給与・待遇', '夜勤', '業務負担', '利用者対応',
    '職場の人間関係', '管理者への意見', 'ケアの方法', '介護記録',
    'ICT・DX', '新人教育', '資格・キャリア', '介護制度', '良かったこと',
    '現場のアイデア', 'その他'
  ];

  // Clean old posts and dependent tables
  await prisma.objectiveData.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.aiAnalysis.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({ where: { industryId: careIndustry.id } });

  for (let i = 0; i < categoryNames.length; i++) {
    await prisma.category.create({
      data: {
        industryId: careIndustry.id,
        name: categoryNames[i],
        displayOrder: i + 1,
      },
    });
  }

  const dbCategories = await prisma.category.findMany({ where: { industryId: careIndustry.id } });
  const categoryMap = {};
  dbCategories.forEach(c => { categoryMap[c.name] = c.id; });

  // 2. Create Fields (大分類: 高齢者介護, 障害福祉, 医療・看護, その他の福祉)
  const fieldData = [
    { name: '高齢者介護', slug: 'elderly' },
    { name: '障害福祉', slug: 'disability' },
    { name: '医療・看護', slug: 'medical_nursing' },
    { name: 'その他の福祉', slug: 'other' },
  ];

  const fieldMap = {};
  for (const f of fieldData) {
    const created = await prisma.field.upsert({
      where: { slug: f.slug },
      update: { name: f.name },
      create: f,
    });
    fieldMap[f.slug] = created.id;
  }

  // 3. Create Prefectures & Municipalities
  const prefData = [
    {
      name: '栃木県', slug: 'tochigi',
      municipalities: [
        { name: '宇都宮市', slug: 'utsunomiya' },
        { name: '小山市', slug: 'oyama' },
        { name: '栃木市', slug: 'tochigi-city' }
      ]
    },
    {
      name: '群馬県', slug: 'gunma',
      municipalities: [
        { name: '前橋市', slug: 'maebashi' },
        { name: '高崎市', slug: 'takasaki' }
      ]
    },
    {
      name: '東京都', slug: 'tokyo',
      municipalities: [
        { name: '世田谷区', slug: 'setagaya' },
        { name: '新宿区', slug: 'shinjuku' },
        { name: '八王子市', slug: 'hachioji' }
      ]
    },
    {
      name: '大阪府', slug: 'osaka',
      municipalities: [
        { name: '大阪市', slug: 'osaka-city' },
        { name: '堺市', slug: 'sakai' }
      ]
    },
    {
      name: '愛知県', slug: 'aichi',
      municipalities: [
        { name: '名古屋市', slug: 'nagoya' }
      ]
    }
  ];

  const prefMap = {};
  const muniMap = {};

  for (const p of prefData) {
    const pref = await prisma.prefecture.upsert({
      where: { slug: p.slug },
      update: { name: p.name },
      create: { name: p.name, slug: p.slug }
    });
    prefMap[p.slug] = pref.id;

    for (const m of p.municipalities) {
      const muni = await prisma.municipality.upsert({
        where: { prefectureId_slug: { prefectureId: pref.id, slug: m.slug } },
        update: { name: m.name },
        create: { prefectureId: pref.id, name: m.name, slug: m.slug }
      });
      muniMap[`${p.slug}_${m.slug}`] = muni.id;
    }
  }

  // 4. Create Occupations (Explicit Nursing & Rehab Roles)
  const occupationNames = [
    '看護師 (正看護師)',
    '准看護師',
    '理学療法士 (PT)',
    '作業療法士 (OT)',
    '言語聴覚士 (ST)',
    '介護福祉士',
    '介護職員（無資格）',
    '初任者研修・ヘルパー2級',
    '実務者研修・ヘルパー1級',
    'ケアマネジャー（介護支援専門員）',
    'サービス提供責任者',
    '生活相談員',
    '施設長・管理者',
    '障害福祉職',
    '相談支援専門員',
    'その他'
  ];

  const occMap = {};
  for (const occName of occupationNames) {
    let occ = await prisma.occupation.findFirst({ where: { name: occName } });
    if (!occ) {
      occ = await prisma.occupation.create({ data: { name: occName } });
    }
    occMap[occName] = occ.id;
  }

  // 5. Create Service Types (Including Visiting Nursing & Rehab)
  const serviceTypeData = [
    { fieldSlug: 'medical_nursing', name: '訪問看護ステーション' },
    { fieldSlug: 'medical_nursing', name: '訪問リハビリテーション' },
    { fieldSlug: 'medical_nursing', name: '病院・クリニック' },
    { fieldSlug: 'elderly', name: '特別養護老人ホーム' },
    { fieldSlug: 'elderly', name: '介護老人保健施設 (老健)' },
    { fieldSlug: 'elderly', name: '有料老人ホーム' },
    { fieldSlug: 'elderly', name: 'グループホーム' },
    { fieldSlug: 'elderly', name: 'デイサービス' },
    { fieldSlug: 'elderly', name: '訪問介護' },
    { fieldSlug: 'elderly', name: '小規模多機能' },
    { fieldSlug: 'disability', name: '障害福祉サービス' },
    { fieldSlug: 'disability', name: '障害者グループホーム' },
    { fieldSlug: 'disability', name: '相談支援事業所' },
  ];

  const serviceTypeMap = {};
  for (const st of serviceTypeData) {
    let type = await prisma.serviceType.findFirst({ where: { name: st.name } });
    if (!type) {
      type = await prisma.serviceType.create({
        data: {
          name: st.name,
          fieldId: fieldMap[st.fieldSlug]
        }
      });
    }
    serviceTypeMap[st.name] = type.id;
  }

  // 6. Create Realistic Test Posts
  // Post 1: 夜勤記録負担 (介護福祉士)
  const post1 = await prisma.post.create({
    data: {
      postType: 'ISSUE',
      industryId: careIndustry.id,
      categoryId: categoryMap['介護記録'],
      fieldId: fieldMap['elderly'],
      prefectureId: prefMap['tokyo'],
      municipalityId: muniMap['tokyo_setagaya'],
      serviceTypeId: serviceTypeMap['特別養護老人ホーム'],
      occupationId: occMap['介護福祉士'],
      title: '夜勤明けの記録業務と手書き転記の二重負担',
      content: '私たちの施設では、夜勤明けの午前中に前日の経過記録をすべて手書きで帳票に転記する作業があります。集中力が切れている中で2時間以上かけて書類仕事をするのは限界を感じています。音声入力やタブレットでのその場入力を導入してほしいです。',
      frequency: 'DAILY',
      urgency: 'HIGH',
      resolutionStatus: 'UNHANDLED',
      posterType: 'ANONYMOUS',
      posterOccupation: '介護福祉士',
      posterExperienceYears: 4,
      posterPrefecture: '東京都',
      status: 'PUBLISHED',
      objectiveData: {
        create: {
          nightShiftCount: 5,
          nightShiftHours: 16,
          nightShiftStaff: 2,
          assignedResidents: 30,
          overtimeHours: 2
        }
      }
    }
  });

  // Post 2: 人手不足と有給未消化 (介護職員)
  const post2 = await prisma.post.create({
    data: {
      postType: 'ISSUE',
      industryId: careIndustry.id,
      categoryId: categoryMap['人手不足'],
      fieldId: fieldMap['elderly'],
      prefectureId: prefMap['osaka'],
      municipalityId: muniMap['osaka_osaka-city'],
      serviceTypeId: serviceTypeMap['デイサービス'],
      occupationId: occMap['介護職員（無資格）'],
      title: '人手不足で有給休日の取得申請がしづらい雰囲気',
      content: '慢性的な人手不足でシフトがギリギリで組まれています。有給を申請しようとすると他のスタッフへの負担がかかるため、気まずくて申請できません。他のみなさんの現場では、有給消化の仕組みはどのように改善されていますか？',
      frequency: 'DAILY',
      urgency: 'HIGH',
      resolutionStatus: 'UNDER_REVIEW',
      posterType: 'ANONYMOUS',
      posterOccupation: '介護職員（無資格）',
      posterExperienceYears: 2,
      posterPrefecture: '大阪府',
      status: 'PUBLISHED'
    }
  });

  // Post 3: 看護師の訪問看護オンコール負担 (正看護師)
  const post3 = await prisma.post.create({
    data: {
      postType: 'ISSUE',
      industryId: careIndustry.id,
      categoryId: categoryMap['夜勤'],
      fieldId: fieldMap['medical_nursing'],
      prefectureId: prefMap['tokyo'],
      municipalityId: muniMap['tokyo_shinjuku'],
      serviceTypeId: serviceTypeMap['訪問看護ステーション'],
      occupationId: occMap['看護師 (正看護師)'],
      title: '訪問看護における夜間オンコール待機負担と手当の課題',
      content: '訪問看護ステーションで勤務しています。月に7〜8回の夜間オンコール待機があり、深夜に緊急訪問した翌日もそのまま日勤に入るケースが多く体力的に限界です。待機手当も低く、看護師の定着率を上げるためにも夜間対応体制の見直しが必要です。',
      frequency: 'WEEKLY',
      urgency: 'CRITICAL',
      resolutionStatus: 'UNHANDLED',
      posterType: 'NICKNAME',
      posterOccupation: '看護師 (正看護師)',
      posterExperienceYears: 9,
      posterPrefecture: '東京都',
      status: 'PUBLISHED',
      objectiveData: {
        create: {
          nightShiftCount: 8,
          nightShiftHours: 14,
          overtimeHours: 12
        }
      }
    }
  });

  // Post 4: リハビリ職の書類・個別計画書負担 (理学療法士 PT)
  const post4 = await prisma.post.create({
    data: {
      postType: 'ISSUE',
      industryId: careIndustry.id,
      categoryId: categoryMap['業務負担'],
      fieldId: fieldMap['elderly'],
      prefectureId: prefMap['tochigi'],
      municipalityId: muniMap['tochigi_utsunomiya'],
      serviceTypeId: serviceTypeMap['介護老人保健施設 (老健)'],
      occupationId: occMap['理学療法士 (PT)'],
      title: '理学療法士の個別リハ計画書作成と実績管理の事務負担',
      content: '老健および訪問リハで勤務するPTです。リハビリ提供時間以外の書類作成（計画書・経過評価表・月次報告書）が膨大で、本来の患者様・利用者様への直接リハビリ時間が圧迫されています。フォーマットの簡素化を望みます。',
      frequency: 'DAILY',
      urgency: 'MEDIUM',
      resolutionStatus: 'IMPROVING',
      posterType: 'ANONYMOUS',
      posterOccupation: '理学療法士 (PT)',
      posterExperienceYears: 6,
      posterPrefecture: '栃木県',
      status: 'PUBLISHED',
      objectiveData: {
        create: {
          assignedResidents: 25,
          overtimeHours: 8
        }
      }
    }
  });

  // Post 5: ICT成功事例 (施設長)
  const post5 = await prisma.post.create({
    data: {
      postType: 'SUCCESS_STORY',
      industryId: careIndustry.id,
      categoryId: categoryMap['ICT・DX'],
      fieldId: fieldMap['elderly'],
      prefectureId: prefMap['gunma'],
      municipalityId: muniMap['gunma_maebashi'],
      serviceTypeId: serviceTypeMap['グループホーム'],
      occupationId: occMap['施設長・管理者'],
      title: '介護記録ソフトの音声入力化で月10時間の残業削減を達成した事例',
      content: '手書き記録を撤廃し、スマホアプリによる音声入力支援ツールを導入しました。最初は操作に戸惑う職員もいましたが、1on1でのサポートを行い、結果として転記作業がゼロになり残業時間が大幅に削減されました。',
      frequency: 'DAILY',
      urgency: 'LOW',
      resolutionStatus: 'RESOLVED',
      improvementProposal: '音声入力とスマホ記録のルール化、全職員向け体験勉強会の実施',
      posterType: 'NICKNAME',
      posterOccupation: '施設長・管理者',
      posterExperienceYears: 15,
      posterPrefecture: '群馬県',
      status: 'PUBLISHED'
    }
  });

  // Seed Mock Reactions
  const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5', '192.168.1.6', '192.168.1.7', '192.168.1.8', '192.168.1.9', '192.168.1.10'];

  for (let i = 0; i < 12; i++) {
    await prisma.reaction.create({ data: { postId: post1.id, type: 'SAME_WORKPLACE', ipAddress: ips[i % ips.length] + `_${i}` } });
  }
  for (let i = 0; i < 18; i++) {
    await prisma.reaction.create({ data: { postId: post2.id, type: 'SAME_WORKPLACE', ipAddress: ips[i % ips.length] + `_${i}` } });
  }
  for (let i = 0; i < 15; i++) {
    await prisma.reaction.create({ data: { postId: post3.id, type: 'SAME_WORKPLACE', ipAddress: ips[i % ips.length] + `_n_${i}` } });
  }
  for (let i = 0; i < 9; i++) {
    await prisma.reaction.create({ data: { postId: post4.id, type: 'SAME_WORKPLACE', ipAddress: ips[i % ips.length] + `_r_${i}` } });
  }

  for (let i = 0; i < 25; i++) {
    await prisma.reaction.create({ data: { postId: post5.id, type: 'HELPFUL', ipAddress: ips[i % ips.length] + `_h_${i}` } });
  }

  console.log('Seed execution completed successfully with Nursing & Rehab roles!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
