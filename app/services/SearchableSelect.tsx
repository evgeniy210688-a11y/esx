'use client';
import { Children, isValidElement, useEffect, useId, useRef, useState, type SelectHTMLAttributes, type ReactNode } from 'react';

export default function SearchableSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const select = useRef<HTMLSelectElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const options: {value:string;label:string;disabled?:boolean}[] = [];
  function collect(children: ReactNode) {
    Children.forEach(children, child => {
      if (!isValidElement<{value?:string;disabled?:boolean;children?:ReactNode}>(child)) return;
      if (child.type === 'option') options.push({value:String(child.props.value ?? child.props.children ?? ''),label:String(child.props.children ?? child.props.value ?? ''),disabled:child.props.disabled});
      else collect(child.props.children);
    });
  }
  collect(props.children);
  const labelFor = (value: unknown) => options.find(option => !option.disabled && option.value === String(value))?.label ?? '';
  const [text,setText] = useState(() => labelFor(props.value ?? props.defaultValue ?? options[0]?.value));
  const selectedLabel = props.value === undefined ? undefined : labelFor(props.value);
  useEffect(() => { if (selectedLabel !== undefined) { setText(selectedLabel); input.current?.setCustomValidity(''); } }, [selectedLabel]);
  useEffect(() => {
    const form = select.current?.form;
    const reset = () => setTimeout(() => { setText(labelFor(select.current?.value)); input.current?.setCustomValidity(''); },0);
    form?.addEventListener('reset',reset);
    return () => form?.removeEventListener('reset',reset);
  });
  return <>
    <input ref={input} id={props.id} list={id} value={text} disabled={props.disabled} required={props.required} autoComplete="off" placeholder="Введите или выберите вариант" aria-label={props['aria-label']} onFocus={event => event.currentTarget.select()} onChange={event => {
      const text = event.target.value; setText(text);
      const match = options.find(option => !option.disabled && option.label.toLocaleLowerCase() === text.toLocaleLowerCase());
      event.target.setCustomValidity(match ? '' : 'Выберите вариант из списка.');
      if (match && select.current) { select.current.value = match.value; select.current.dispatchEvent(new Event('change',{bubbles:true})); }
    }} onBlur={() => { setText(labelFor(select.current?.value)); input.current?.setCustomValidity(''); }} />
    <datalist id={id}>{options.filter(option => !option.disabled).map(option => <option key={option.value} value={option.label} />)}</datalist>
    <select {...props} id={undefined} ref={select} required={false} hidden aria-hidden="true" tabIndex={-1} style={{display:'none'}} />
  </>;
}
