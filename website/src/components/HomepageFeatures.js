import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import Translate, { translate } from '@docusaurus/Translate';

const FeatureList = [
  {
    title: <><Translate>稳定性</Translate></>,
    Svg: require('../../static/img/stabilize.svg').default,
    description: (
      <>
       <Translate>轻松获得支撑千万日活服务的稳定性</Translate>
      </>
    ),
  },
  {
    title: <><Translate>服务治理</Translate></>,
    Svg: require('../../static/img/govern.svg').default,
    description: (
      <>
        <Translate>内建级联超时控制、限流、自适应熔断、自适应降载等微服务治理能力，无需配置和额外代码</Translate>
      </>
    ),
  },
  {
    title: <><Translate>可插拔</Translate></>,
    Svg: require('../../static/img/move.svg').default,
    description: (
      <>
        <Translate>微服务治理中间件可无缝集成到其它现有框架使用</Translate>
      </>
    ),
  },
  {
      title: <><Translate>代码自动生成</Translate></>,
      Svg: require('../../static/img/code-gen.svg').default,
      description: (
        <>
           <Translate>极简的 API 描述，一键生成各端代码</Translate>
        </>
      ),
    },
    {
      title: <><Translate>效验请求合法性</Translate></>,
      Svg: require('../../static/img/validate.svg').default,
      description: (
        <>
            <Translate>自动校验客户端请求参数合法性</Translate>
        </>
      ),
    },
    {
      title: <><Translate>工具包</Translate></>,
      Svg: require('../../static/img/tool.svg').default,
      description: (
        <>
            <Translate>大量微服务治理和并发工具包</Translate>
        </>
      ),
    },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
