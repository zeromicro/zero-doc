---
sidebar_position: 18
---

# DB Cache

## QueryRowIndex

* 没有查询条件到Primary映射的缓存
  * 通过查询条件到DB去查询行记录，然后
    * **把Primary到行记录的缓存写到redis里**
    * **把查询条件到Primary的映射保存到redis里**，*框架的Take方法自动做了*
  * 可能的过期顺序
    * 查询条件到Primary的映射缓存未过期
      * Primary到行记录的缓存未过期
        * 直接返回缓存行记录
      * Primary到行记录的缓存已过期
        * 通过Primary到DB获取行记录，并写入缓存
          * 此时存在的问题是，查询条件到Primary的缓存可能已经快要过期了，短时间内的查询又会触发一次数据库查询
          * 要避免这个问题，可以让**上面粗体部分**第一个过期时间略长于第二个，比如5秒
    * 查询条件到Primary的映射缓存已过期，不管Primary到行记录的缓存是否过期
      * 查询条件到Primary的映射会被重新获取，获取过程中会自动写入新的Primary到行记录的缓存，这样两种缓存的过期时间都是刚刚设置
* 有查询条件到Primary映射的缓存
  * 没有Primary到行记录的缓存
    * 通过Primary到DB查询行记录，并写入缓存
  * 有Primary到行记录的缓存
    * 直接返回缓存结果