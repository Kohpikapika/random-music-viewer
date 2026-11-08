export const livers = [
  {
    key: 'mayui',
    name: '繭糸',
    initial: '繭',
    color: '#f28c28',
    tint: '#fff2e4',
  },
  {
    key: 'michitose',
    name: 'みちとせ',
    initial: 'み',
    color: '#36a269',
    tint: '#e9f7ef',
  },
  {
    key: 'soreyue',
    name: 'それ故',
    initial: '故',
    color: '#37a9d6',
    tint: '#e8f7fc',
  },
]

// ユニット動画は3人の均等抽選には含めず、myme専用タブで扱う。
export const mymeChannel = {
  key: 'myme',
  name: 'myme',
  initial: 'M',
  isGroup: true,
  color: '#5f6368',
  tint: '#f1f3f4',
}

export const liverByKey = Object.fromEntries(livers.map((liver) => [liver.key, liver]))
