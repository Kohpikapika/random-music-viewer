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

export const liverByKey = Object.fromEntries(livers.map((liver) => [liver.key, liver]))
