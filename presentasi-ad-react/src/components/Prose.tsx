import type { CSSProperties, ElementType } from 'react';

type ProseProps = {
  /**
   * HTML yang ditulis tangan di file konten (src/content/*.ts), BUKAN input user.
   * Semua string ini ada di repo dan tidak pernah menerima data eksternal, jadi
   * markup inline (<em>, <code>, <strong>, <br>) bisa dipertahankan persis seperti
   * versi vanilla tanpa mengubah satu kata pun isinya.
   */
  html: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

export function Prose({ html, as: Tag = 'div', className, style }: ProseProps) {
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
