require('dotenv').config();
const { Client } = require('pg');

const CURRENCY_CNY_ID = 'c778b6df-e498-4e44-b727-dbad3e4ee5a3';

const FINANCIALS = {
  revenue: '¥7777亿',
  profit: '402亿',
  roe: '15.5%',
  debtRatio: '55.4%',
  annualData: [
    { year: '2023', revenue: 6023, profit: 300, roe: 15.1, debtRatio: 54.8 },
    { year: '2024', revenue: 7777, profit: 402, roe: 15.5, debtRatio: 55.4 },
  ],
  trendData: {
    revenueAndProfit: [
      { name: '2023.0', revenue: 6023, profit: 300 },
      { name: '2023.5', revenue: 6800, profit: 340 },
      { name: '2024.0', revenue: 7777, profit: 402 },
    ],
    roeAndDebt: [
      { name: '2023.0', roe: 15.1, debtRatio: 54.8 },
      { name: '2023.5', roe: 15.3, debtRatio: 55.0 },
      { name: '2024.0', roe: 15.5, debtRatio: 55.4 },
    ],
  },
};

const FOCUS_NOTE = {
  title: '和比亚迪洽谈融资需求',
  titleEn: 'Negotiate financing needs with BYD',
  status: '可以继续推进',
  statusEn: 'Can continue to proceed',
  author: '张三',
  authorEn: 'John Zhang',
  time: '2025-07-09 12:27:45',
};

const ANNOTATIONS = [
  {
    title: '和比亚迪洽谈融资需求',
    status: '可以继续推进',
    content: '张三',
    created_at: '2025-07-09 12:27:45',
  },
];

const INTERACTIONS = [
  {
    subject: 'Visit CFO to understand new financial report progress',
    interaction_date: '2025-06-12',
    description:
      '拜访财务总监，了解新财报进展 / Visit CFO to understand new financial report progress',
    location: 'Shenzhen HQ',
    next_action: 'Prepare follow-up financial proposal',
    private_notes: '重点关注公司现金流情况。',
  },
  {
    subject: 'Discuss cooperation details with European automakers',
    interaction_date: '2025-06-09',
    description:
      '讨论与欧洲车企合作细节 / Discuss cooperation details with European automakers',
    location: 'Shenzhen HQ',
    next_action: 'Draft cooperation framework summary',
    private_notes: '对欧洲市场扩张非常积极，需评估融资方案。',
  },
  {
    subject: 'Discuss European market cooperation details',
    interaction_date: '2025-09-12',
    description:
      '讨论欧洲市场合作细节 / Discuss European market cooperation details',
    location: 'Shanghai Office',
    next_action: 'Schedule executive follow-up meeting',
    private_notes: '预计四季度达成初步合作意向书。',
  },
];

function parseDate(input) {
  return new Date(`${input}T00:00:00Z`);
}

async function run() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE_ALIA,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query('BEGIN');

  try {
    const userRes = await client.query(
      'SELECT user_id FROM "user" WHERE is_active = true ORDER BY created_at LIMIT 1'
    );
    if (userRes.rows.length === 0) {
      throw new Error('No active user found to own seeded data.');
    }
    const ownerUserId = userRes.rows[0].user_id;

    const customFields = {
      name_cn: '比亚迪',
      ticker: '002594.SZ',
      company_type_cn: '上市',
      company_type_en: 'Listed',
      sector_cn: '汽车',
      sector_en: 'Automotive',
      market_cap_display: '¥9000亿',
      stock_price_display: '¥250.00',
      pe_ratio_display: '35.2',
      rating_display: 'A+',
      financials: FINANCIALS,
      focus: FOCUS_NOTE,
      source: 'seeded_mock',
    };

    const marketCapNumeric = 900000000000;

    const customerRes = await client.query(
      'SELECT customer_id FROM customer WHERE company_name = $1',
      ['BYD']
    );

    let customerId;
    if (customerRes.rows.length === 0) {
      const insertCustomer = await client.query(
        `
          INSERT INTO customer (
            company_name,
            industry_code,
            listing_status,
            stock_symbol,
            market_cap,
            currency_id,
            introduction,
            description,
            country,
            region,
            customer_type,
            status,
            owner_user_id,
            custom_fields,
            website,
            source
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16
          )
          RETURNING customer_id
        `,
        [
          'BYD',
          'MANUF',
          'listed',
          '002594.SZ',
          marketCapNumeric,
          CURRENCY_CNY_ID,
          'BYD is a leading Chinese new energy vehicle manufacturer, with business covering automotive, rail transit, new energy, and electronics sectors.',
          '比亚迪是中国领先的新能源汽车制造商，业务涵盖汽车、轨道交通、新能源和电子等领域。',
          'China',
          'APAC',
          'strategic',
          'active',
          ownerUserId,
          customFields,
          'https://www.byd.com',
          'seeded_mock',
        ]
      );
      customerId = insertCustomer.rows[0].customer_id;
    } else {
      customerId = customerRes.rows[0].customer_id;
      await client.query(
        `
          UPDATE customer
          SET industry_code = $2,
              listing_status = $3,
              stock_symbol = $4,
              market_cap = $5,
              currency_id = $6,
              introduction = $7,
              description = $8,
              country = $9,
              region = $10,
              customer_type = $11,
              status = $12,
              owner_user_id = $13,
              custom_fields = $14,
              website = $15,
              source = $16,
              updated_at = NOW()
          WHERE customer_id = $1
        `,
        [
          customerId,
          'MANUF',
          'listed',
          '002594.SZ',
          marketCapNumeric,
          CURRENCY_CNY_ID,
          'BYD is a leading Chinese new energy vehicle manufacturer, with business covering automotive, rail transit, new energy, and electronics sectors.',
          '比亚迪是中国领先的新能源汽车制造商，业务涵盖汽车、轨道交通、新能源和电子等领域。',
          'China',
          'APAC',
          'strategic',
          'active',
          ownerUserId,
          customFields,
          'https://www.byd.com',
          'seeded_mock',
        ]
      );
    }

    for (const interaction of INTERACTIONS) {
      await client.query(
        'DELETE FROM interaction WHERE customer_id = $1 AND subject = $2',
        [customerId, interaction.subject]
      );

      await client.query(
        `
          INSERT INTO interaction (
            interaction_type,
            subject,
            interaction_date,
            customer_id,
            location,
            description,
            next_action,
            created_by,
            duration_minutes,
            direction,
            medium,
            outcome,
            sentiment,
            importance,
            private_notes
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15
          )
        `,
        [
          'Customer Visit',
          interaction.subject,
          parseDate(interaction.interaction_date),
          customerId,
          interaction.location,
          interaction.description,
          interaction.next_action,
          ownerUserId,
          60,
          'outbound',
          'in-person',
          'in-progress',
          'positive',
          3,
          interaction.private_notes,
        ]
      );
    }

    for (const annotation of ANNOTATIONS) {
      await client.query(
        'DELETE FROM annotation WHERE customer_id = $1 AND title = $2',
        [customerId, annotation.title]
      );

      await client.query(
        `
          INSERT INTO annotation (
            customer_id,
            title,
            status,
            content,
            created_by,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          customerId,
          annotation.title,
          annotation.status,
          annotation.content,
          ownerUserId,
          new Date(annotation.created_at.replace(' ', 'T') + 'Z'),
        ]
      );
    }

    await client.query('COMMIT');
    console.log('BYD data seeded successfully. Customer ID:', customerId);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed BYD data:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
