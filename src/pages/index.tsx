import styles from './index.less';
import { Fragment, useEffect, useState } from 'react';
import { Button, Dialog } from 'antd-mobile';
import classNames from 'classnames';

const LAYER_NUM = 4;
const LINE_NUM = 7;
const px2vw = (pixels: number) => {
  const pixelTotal = 750;
  const unitPrecision = 3;
  const minPixelValue = 1;
  if (pixels <= minPixelValue) {
    return `${pixels}px`;
  }
  return `${((pixels / pixelTotal) * 100).toFixed(unitPrecision)}vw`;
};
const layer = [[LINE_NUM, LINE_NUM]];
let base: number[] = [];
export default function HomePage() {
  const [blanks, setBlanks] = useState<number[][][]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [pool, setPool] = useState<number[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  // 判断当前方块是否被其他方块覆盖了
  const isCover = (i: number, j: number, k: number) => {
    let curL = k;
    do {
      if (curL === LAYER_NUM - 1) {
        return false;
      } else if (blanks[k + 1]) {
        const upLayer = blanks[k + 1];
        if (
          upLayer[i] &&
          (upLayer[i][j] || upLayer[i][j + 1] || upLayer[i][j - 1])
        ) {
          return true;
        }
        if (
          upLayer[i - 1] &&
          (upLayer[i - 1][j] || upLayer[i - 1][j + 1] || upLayer[i - 1][j - 1])
        ) {
          return true;
        }
        if (
          upLayer[i + 1] &&
          (upLayer[i + 1][j] || upLayer[i + 1][j + 1] || upLayer[i + 1][j - 1])
        ) {
          return true;
        }
      }
      curL++;
    } while (curL <= LAYER_NUM - 1);
    return false;
  };
  const refresh = () => {
    const p = [...pool.filter((item) => item !== 0)];
    p.sort(() => {
      return 0.5 - Math.random();
    });
    const n = blanks.map((l) =>
      l.map((d) =>
        d.map((b) => {
          if (b !== 0) {
            return p.pop();
          }
          return 0;
        }),
      ),
    );
    setBlanks(n as any);
  };
  const initPool = (count: number) => {
    console.log('poolCount:=>>>', count * 3);
    for (let k = 0; k < count; k++) {
      let r = Math.floor(Math.random() * 16);
      if (r > 10) r = 0;
      base = base.concat([r, r, r]);
    }
    base.sort(() => {
      return 0.5 - Math.random();
    });
    setPool([...base]);
  };
  const initLayer = (index: number) => {
    let currentLayer = layer[index];
    let w = currentLayer[0];
    let h = currentLayer[1];
    const x = w % LINE_NUM ? 1 : 0;
    const y = h % LINE_NUM ? 1 : 0;
    const data: number[][] = [];
    for (let i = 0; i < 2 * h; i++) {
      data[i] = [];
      for (let j = 0; j < 2 * w; j++) {
        data[i][j] = 0;
      }
    }
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        data[i * 2 + x][j * 2 + y] = base.pop() || 0;
      }
    }
    return data;
  };
  const initBlanks = (layerNum: number = 1) => {
    let num = layerNum;
    do {
      layer.push([
        LINE_NUM - Math.round(Math.random()),
        LINE_NUM - Math.round(Math.random()),
      ]);
      num--;
    } while (num > 1);
    let count = 0;
    layer.forEach((l) => {
      count += l[0] * l[1];
    });
    initPool(Math.trunc(count / 3));
    const data = [];
    num = 0;
    do {
      data.push(initLayer(num));
      num++;
    } while (num < layerNum);
    setBlanks(data);
  };
  const clickBlank = (i: number, j: number, k: number) => {
    const b = blanks[k][i][j];
    if (b !== 0 && result.length < 7 && !isCover(i, j, k)) {
      setResult([...result, b].sort());
      pool.splice(pool.indexOf(b), 1);
      setPool(pool);
      blanks[k][i][j] = 0;
      setBlanks(blanks);
      if (ready && pool.filter((p) => p !== 0).length === 0) {
        Dialog.alert({
          content: '闯关成功！！！',
          confirmText: '重新开始',
          onConfirm: () => {
            restart();
          },
        });
      }
    }
  };
  useEffect(() => {
    restart();
  }, []);
  const restart = () => {
    base = [];
    setResult([]);
    initBlanks(LAYER_NUM);
    setReady(true);
  };
  useEffect(() => {
    const m: { [key: number]: number } = {};
    result.forEach((r) => {
      if (typeof m[r] === 'undefined') {
        m[r] = 0;
      }
      m[r]++;
    });
    let temp = result;
    for (let k in m) {
      if (m[k] >= 3) {
        temp = result.filter((r) => r !== Number(k));
        setResult(temp);
      }
    }
    if (temp.length === 7) {
      Dialog.alert({
        content: '游戏结束！！',
        confirmText: '重新开始',
        onConfirm: () => {
          restart();
        },
      });
      return;
    }
  }, [result]);
  useEffect(() => {}, [pool]);
  return (
    <div className={styles.container}>
      <h3>牛了个牛</h3>
      <div className={styles.handle}>
        <Button
          color="primary"
          size={'large'}
          onClick={() => {
            refresh();
          }}
        >
          洗牌
        </Button>
        <Button
          color={'danger'}
          size={'large'}
          onClick={() => {
            restart();
          }}
        >
          重新开始
        </Button>
      </div>
      <div
        className={styles.blankBox}
        style={{ padding: px2vw((750 - LINE_NUM * 80) / 2) }}
      >
        {blanks.map((l, k) => (
          <Fragment key={k + 1}>
            {l.map((d, i) =>
              i % 2 === (d.length % LINE_NUM ? 1 : 0) ? (
                <Fragment key={i + 1}>
                  {d.map((b, j) =>
                    j % 2 === (l.length % LINE_NUM ? 1 : 0) && b !== 0 ? (
                      <div
                        key={j + 1}
                        className={classNames(
                          styles.blankItem,
                          styles[`icon_${b}`],
                        )}
                        style={{
                          backgroundColor: `${
                            isCover(i, j, k) ? '#aaa' : '#fff'
                          }`,
                          left: px2vw((j / 2) * 80 + (750 - LINE_NUM * 80) / 2),
                          top: px2vw((i / 2) * 80 + (750 - LINE_NUM * 80) / 2),
                          zIndex: k,
                          filter: `grayscale(${isCover(i, j, k) ? 70 : 0}%)`,
                        }}
                        onClick={() => {
                          clickBlank(i, j, k);
                        }}
                      ></div>
                    ) : (
                      ''
                    ),
                  )}
                </Fragment>
              ) : (
                ''
              ),
            )}
          </Fragment>
        ))}
      </div>
      <div className={styles.resultBox}>
        {result.map((r, i) => (
          <div
            key={i + 1}
            className={classNames(styles.resultBlankItem, styles[`icon_${r}`])}
          ></div>
        ))}
      </div>
    </div>
  );
}
